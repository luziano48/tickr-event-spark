create or replace function public.tickr_generate_ticket_access_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  random_bytes bytea := pg_catalog.decode(
    pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', ''),
    'hex'
  );
  alphabet text := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  access_code text := '';
  char_index integer;
  byte_index integer;
begin
  for byte_index in 0..9 loop
    char_index := (pg_catalog.get_byte(random_bytes, byte_index) % 36) + 1;
    access_code := access_code || pg_catalog.substr(alphabet, char_index, 1);
  end loop;
  return access_code;
end;
$$;

alter table public.tickr_tickets
  add column if not exists access_code text;

update public.tickr_tickets
set access_code = public.tickr_generate_ticket_access_code()
where access_code is null;

alter table public.tickr_tickets
  alter column access_code set default public.tickr_generate_ticket_access_code(),
  alter column access_code set not null;

alter table public.tickr_tickets
  drop constraint if exists tickr_tickets_access_code_format;
alter table public.tickr_tickets
  add constraint tickr_tickets_access_code_format check (access_code ~ '^[A-Z0-9]{10}$');

create unique index if not exists tickr_tickets_access_code_key
  on public.tickr_tickets (access_code);

create table if not exists public.tickr_ticket_access_challenges (
  id uuid primary key,
  ticket_id uuid not null references public.tickr_tickets(id) on delete cascade,
  otp_hash text not null check (otp_hash ~ '^[a-f0-9]{64}$'),
  attempts integer not null default 0 check (attempts between 0 and 5),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tickr_ticket_access_challenges_expiry_idx
  on public.tickr_ticket_access_challenges (expires_at);

create table if not exists public.tickr_ticket_access_attempts (
  ip_hash text not null check (ip_hash ~ '^[a-f0-9]{64}$'),
  action text not null check (action in ('request', 'verify')),
  window_started_at timestamptz not null default now(),
  attempts integer not null check (attempts >= 1),
  updated_at timestamptz not null default now(),
  primary key (ip_hash, action)
);

create index if not exists tickr_ticket_access_attempts_lookup_idx
  on public.tickr_ticket_access_attempts (updated_at);

alter table public.tickr_ticket_access_challenges enable row level security;
alter table public.tickr_ticket_access_attempts enable row level security;

revoke all on public.tickr_ticket_access_challenges from public, anon, authenticated;
revoke all on public.tickr_ticket_access_attempts from public, anon, authenticated;
grant all on public.tickr_ticket_access_challenges to service_role;
grant all on public.tickr_ticket_access_attempts to service_role;

create or replace function public.tickr_allow_ticket_access_attempt(
  p_ip_hash text,
  p_action text,
  p_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  window_start timestamptz;
  attempt_count integer;
begin
  if p_ip_hash is null or p_ip_hash !~ '^[a-f0-9]{64}$'
    or p_action not in ('request', 'verify') or p_limit < 1 then
    return false;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_ip_hash || ':' || p_action, 0)
  );
  delete from public.tickr_ticket_access_attempts
  where updated_at < now() - interval '1 day';

  select window_started_at, attempts
    into window_start, attempt_count
  from public.tickr_ticket_access_attempts
  where ip_hash = p_ip_hash and action = p_action
  for update;

  if not found then
    insert into public.tickr_ticket_access_attempts (ip_hash, action, attempts)
    values (p_ip_hash, p_action, 1);
    return true;
  end if;

  if window_start < now() - interval '15 minutes' then
    update public.tickr_ticket_access_attempts
    set window_started_at = now(), attempts = 1, updated_at = now()
    where ip_hash = p_ip_hash and action = p_action;
    return true;
  end if;

  if attempt_count >= p_limit then
    return false;
  end if;

  update public.tickr_ticket_access_attempts
  set attempts = attempts + 1, updated_at = now()
  where ip_hash = p_ip_hash and action = p_action;
  return true;
end;
$$;

create or replace function public.tickr_request_ticket_access(
  p_access_code text,
  p_contact text,
  p_ip_hash text,
  p_challenge_id uuid,
  p_otp_hash text
)
returns table (found boolean, recipient_email text, event_title text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  order_email text;
  title text;
  matched_ticket_id uuid;
  normalized_contact text := lower(btrim(p_contact));
  contact_is_email boolean := position('@' in p_contact) > 0;
begin
  if not public.tickr_allow_ticket_access_attempt(p_ip_hash, 'request', 5) then
    return query select false, null::text, null::text;
    return;
  end if;

  delete from public.tickr_ticket_access_challenges
  where expires_at < now() or consumed_at is not null;

  select ticket.id, purchase_order.buyer_email, event.title
    into matched_ticket_id, order_email, title
  from public.tickr_tickets as ticket
  join public.tickr_order_items as item on item.id = ticket.order_item_id
  join public.tickr_orders as purchase_order on purchase_order.id = item.order_id
  join public.tickr_events as event on event.id = ticket.event_id
  where ticket.access_code = upper(btrim(p_access_code))
    and ticket.status = 'valid'
    and purchase_order.status = 'paid'
    and event.status = 'published'
    and (
      (contact_is_email and lower(purchase_order.buyer_email) = normalized_contact)
      or (
        not contact_is_email
        and regexp_replace(purchase_order.buyer_phone, '[^0-9]', '', 'g')
          = regexp_replace(p_contact, '[^0-9]', '', 'g')
      )
    )
  limit 1;

  if matched_ticket_id is null then
    return query select false, null::text, null::text;
    return;
  end if;

  insert into public.tickr_ticket_access_challenges (id, ticket_id, otp_hash, expires_at)
  values (p_challenge_id, matched_ticket_id, p_otp_hash, now() + interval '5 minutes');
  return query select true, order_email, title;
end;
$$;

create or replace function public.tickr_verify_ticket_access(
  p_challenge_id uuid,
  p_otp_hash text,
  p_ip_hash text
)
returns table (
  ticket_code text,
  qr_token_hash text,
  ticket_status text,
  checked_in_at timestamptz,
  event_title text,
  event_starts_at timestamptz,
  event_city text,
  event_venue text,
  ticket_name text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  challenge public.tickr_ticket_access_challenges%rowtype;
begin
  if not public.tickr_allow_ticket_access_attempt(p_ip_hash, 'verify', 10) then
    return;
  end if;

  select * into challenge
  from public.tickr_ticket_access_challenges as access
  where access.id = p_challenge_id
    and access.expires_at > now()
    and access.consumed_at is null
  for update;

  if not found or challenge.attempts >= 5 then
    return;
  end if;

  if challenge.otp_hash <> p_otp_hash then
    update public.tickr_ticket_access_challenges
    set attempts = attempts + 1
    where id = p_challenge_id;
    return;
  end if;

  update public.tickr_ticket_access_challenges
  set consumed_at = now()
  where id = p_challenge_id;

  return query
  select
    ticket.access_code,
    ticket.qr_token_hash,
    ticket.status::text,
    ticket.checked_in_at,
    event.title,
    event.starts_at,
    event.city,
    event.venue,
    item.ticket_name
  from public.tickr_tickets as ticket
  join public.tickr_order_items as item on item.id = ticket.order_item_id
  join public.tickr_orders as purchase_order on purchase_order.id = item.order_id
  join public.tickr_events as event on event.id = ticket.event_id
  where ticket.id = challenge.ticket_id
    and ticket.status in ('valid', 'used')
    and purchase_order.status = 'paid'
    and event.status = 'published';
end;
$$;

revoke all on function public.tickr_allow_ticket_access_attempt(text, text, integer)
  from public, anon, authenticated;
revoke all on function public.tickr_generate_ticket_access_code()
  from public, anon, authenticated;
grant execute on function public.tickr_generate_ticket_access_code() to service_role;
revoke all on function public.tickr_request_ticket_access(text, text, text, uuid, text)
  from public, anon, authenticated;
revoke all on function public.tickr_verify_ticket_access(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.tickr_request_ticket_access(text, text, text, uuid, text)
  to service_role;
grant execute on function public.tickr_verify_ticket_access(uuid, text, text)
  to service_role;
