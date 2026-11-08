create table if not exists public.tickr_ticket_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.tickr_events(id) on delete cascade,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  ticket_name text not null,
  quantity integer not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickr_ticket_requests_name_length check (char_length(buyer_name) between 3 and 100),
  constraint tickr_ticket_requests_email_length check (char_length(buyer_email) between 3 and 320),
  constraint tickr_ticket_requests_phone_length check (char_length(buyer_phone) between 9 and 40),
  constraint tickr_ticket_requests_ticket_name_length check (char_length(ticket_name) between 1 and 80),
  constraint tickr_ticket_requests_quantity check (quantity between 1 and 10),
  constraint tickr_ticket_requests_status check (status in ('new', 'contacted', 'closed'))
);

create index if not exists tickr_ticket_requests_event_idx
  on public.tickr_ticket_requests (event_id, created_at desc);
create index if not exists tickr_ticket_requests_email_idx
  on public.tickr_ticket_requests (event_id, lower(buyer_email), created_at desc);

alter table public.tickr_ticket_requests enable row level security;

drop policy if exists tickr_ticket_requests_owner_read on public.tickr_ticket_requests;
create policy tickr_ticket_requests_owner_read on public.tickr_ticket_requests
  for select to authenticated
  using (public.tickr_can_manage_event(event_id));

drop policy if exists tickr_ticket_requests_owner_update on public.tickr_ticket_requests;
create policy tickr_ticket_requests_owner_update on public.tickr_ticket_requests
  for update to authenticated
  using (public.tickr_can_manage_event(event_id))
  with check (public.tickr_can_manage_event(event_id));

revoke all on public.tickr_ticket_requests from anon, authenticated;
grant select on public.tickr_ticket_requests to authenticated;
grant update (status) on public.tickr_ticket_requests to authenticated;

create or replace function public.tickr_submit_ticket_request(
  p_event_identifier text,
  p_buyer_name text,
  p_buyer_email text,
  p_buyer_phone text,
  p_ticket_name text,
  p_quantity integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_row public.tickr_events%rowtype;
  request_id uuid;
  normalized_email text := lower(btrim(p_buyer_email));
begin
  if p_event_identifier is null or char_length(p_event_identifier) > 160
    or p_buyer_name is null or char_length(btrim(p_buyer_name)) not between 3 and 100
    or normalized_email is null or char_length(normalized_email) not between 3 and 320
    or normalized_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or p_buyer_phone is null or char_length(btrim(p_buyer_phone)) not between 9 and 40
    or p_ticket_name is null or char_length(btrim(p_ticket_name)) not between 1 and 80
    or p_quantity is null or p_quantity not between 1 and 10 then
    raise exception 'Os dados do pedido são inválidos.';
  end if;

  select event.* into event_row
  from public.tickr_events as event
  where (event.id::text = p_event_identifier or event.slug = p_event_identifier)
    and event.status = 'published'
  limit 1;

  if not found then
    raise exception 'Este evento não está disponível para pedidos.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(event_row.id::text || ':' || normalized_email, 0)
  );

  if (
    select count(*)
    from public.tickr_ticket_requests as request
    where request.event_id = event_row.id
      and lower(request.buyer_email) = normalized_email
      and request.created_at > now() - interval '15 minutes'
  ) >= 3 then
    raise exception 'Já foram enviados demasiados pedidos para este evento. Tenta novamente mais tarde.';
  end if;

  insert into public.tickr_ticket_requests (
    event_id, buyer_name, buyer_email, buyer_phone, ticket_name, quantity
  )
  values (
    event_row.id,
    btrim(p_buyer_name),
    normalized_email,
    btrim(p_buyer_phone),
    btrim(p_ticket_name),
    p_quantity
  )
  returning id into request_id;

  return request_id;
end;
$$;

create or replace function public.tickr_list_ticket_requests()
returns table (
  id uuid,
  event_id uuid,
  event_title text,
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  ticket_name text,
  quantity integer,
  status text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Inicia sessão para consultar os pedidos.';
  end if;

  return query
  select
    request.id,
    request.event_id,
    event.title,
    request.buyer_name,
    request.buyer_email,
    request.buyer_phone,
    request.ticket_name,
    request.quantity,
    request.status,
    request.created_at
  from public.tickr_ticket_requests as request
  join public.tickr_events as event on event.id = request.event_id
  where public.tickr_can_manage_event(request.event_id)
  order by request.created_at desc;
end;
$$;

create or replace function public.tickr_update_ticket_request_status(
  p_request_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Inicia sessão para actualizar os pedidos.';
  end if;
  if p_status not in ('contacted', 'closed') then
    raise exception 'Estado do pedido inválido.';
  end if;

  update public.tickr_ticket_requests as request
  set status = p_status,
      updated_at = now()
  where request.id = p_request_id
    and public.tickr_can_manage_event(request.event_id);

  if not found then
    raise exception 'Pedido não encontrado ou sem permissões para o gerir.';
  end if;
end;
$$;

revoke all on function public.tickr_submit_ticket_request(text, text, text, text, text, integer)
  from public;
grant execute on function public.tickr_submit_ticket_request(text, text, text, text, text, integer)
  to anon, authenticated;
revoke all on function public.tickr_list_ticket_requests() from public, anon;
grant execute on function public.tickr_list_ticket_requests() to authenticated;
revoke all on function public.tickr_update_ticket_request_status(uuid, text) from public, anon;
grant execute on function public.tickr_update_ticket_request_status(uuid, text) to authenticated;

notify pgrst, 'reload schema';
