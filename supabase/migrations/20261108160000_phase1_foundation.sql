do $$ begin
  create type public.tickr_business_profile as enum ('organizer', 'service_provider');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.tickr_role as enum (
    'member', 'organizer', 'service_provider', 'moderator', 'admin'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.tickr_event_status as enum (
    'draft', 'pending_review', 'published', 'rejected', 'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.tickr_order_status as enum (
    'pending', 'paid', 'cancelled', 'refunded'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.tickr_ticket_status as enum (
    'valid', 'used', 'void', 'refunded'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.tickr_staff_role as enum ('manager', 'scanner');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.tickr_comment_status as enum ('visible', 'hidden', 'removed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.tickr_sponsor_status as enum (
    'new', 'contacted', 'accepted', 'declined'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.tickr_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  full_name text not null default '',
  avatar_url text,
  bio text not null default '',
  location text not null default '',
  business_profile public.tickr_business_profile,
  instagram text not null default '',
  linkedin text not null default '',
  website text not null default '',
  whatsapp text not null default '',
  public_profile boolean not null default true,
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickr_profiles_username_format
    check (username is null or username ~ '^[A-Za-z0-9._-]{3,30}$'),
  constraint tickr_profiles_full_name_length check (char_length(full_name) <= 100),
  constraint tickr_profiles_bio_length check (char_length(bio) <= 1000)
);

grant usage on type
  public.tickr_business_profile,
  public.tickr_role,
  public.tickr_event_status,
  public.tickr_order_status,
  public.tickr_ticket_status,
  public.tickr_staff_role,
  public.tickr_comment_status,
  public.tickr_sponsor_status
  to anon, authenticated;

create unique index if not exists tickr_profiles_username_lower_key
  on public.tickr_profiles (lower(username))
  where username is not null;

create table if not exists public.tickr_user_roles (
  user_id uuid not null references public.tickr_profiles(id) on delete cascade,
  role public.tickr_role not null,
  granted_by uuid references public.tickr_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.tickr_account_preferences (
  user_id uuid primary key references public.tickr_profiles(id) on delete cascade,
  notifications_enabled boolean not null default true,
  preferred_language text not null default 'pt',
  theme text not null default 'system',
  updated_at timestamptz not null default now(),
  constraint tickr_preferences_language check (preferred_language in ('pt', 'en')),
  constraint tickr_preferences_theme check (theme in ('light', 'dark', 'system'))
);

create table if not exists public.tickr_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.tickr_profiles(id) on delete restrict,
  title text not null,
  slug text not null,
  category text not null,
  description text not null default '',
  status public.tickr_event_status not null default 'draft',
  starts_at timestamptz not null,
  ends_at timestamptz,
  city text not null,
  venue text not null,
  address text not null default '',
  image_url text,
  age_restriction text not null default 'Livre',
  rules text not null default '',
  contact_name text not null default '',
  whatsapp text not null default '',
  currency char(3) not null default 'AOA',
  review_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickr_events_title_length check (char_length(title) between 2 and 120),
  constraint tickr_events_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint tickr_events_category_length check (char_length(category) between 1 and 60),
  constraint tickr_events_city_length check (char_length(city) between 1 and 100),
  constraint tickr_events_ends_after_start check (ends_at is null or ends_at > starts_at),
  constraint tickr_events_currency_format check (currency ~ '^[A-Z]{3}$')
);

create unique index if not exists tickr_events_slug_key
  on public.tickr_events (slug);
create index if not exists tickr_events_public_listing_idx
  on public.tickr_events (starts_at)
  where status = 'published';
create index if not exists tickr_events_owner_idx
  on public.tickr_events (owner_id, created_at desc);

create table if not exists public.tickr_event_staff (
  event_id uuid not null references public.tickr_events(id) on delete cascade,
  user_id uuid not null references public.tickr_profiles(id) on delete cascade,
  role public.tickr_staff_role not null,
  granted_by uuid not null references public.tickr_profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table if not exists public.tickr_ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.tickr_events(id) on delete cascade,
  name text not null,
  price numeric(14, 2) not null default 0,
  quantity integer not null,
  max_per_order integer not null default 10,
  sales_start timestamptz,
  sales_end timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickr_ticket_types_name_length check (char_length(name) between 1 and 80),
  constraint tickr_ticket_types_price_nonnegative check (price >= 0),
  constraint tickr_ticket_types_quantity_nonnegative check (quantity >= 0),
  constraint tickr_ticket_types_order_limit check (max_per_order between 1 and 100),
  constraint tickr_ticket_types_sales_window
    check (sales_start is null or sales_end is null or sales_end > sales_start),
  unique (id, event_id)
);

create index if not exists tickr_ticket_types_event_idx
  on public.tickr_ticket_types (event_id, active);

create table if not exists public.tickr_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.tickr_profiles(id) on delete set null,
  event_id uuid not null references public.tickr_events(id) on delete restrict,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null default '',
  status public.tickr_order_status not null default 'pending',
  currency char(3) not null default 'AOA',
  total numeric(14, 2) not null,
  payment_provider text,
  payment_reference text,
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickr_orders_total_nonnegative check (total >= 0),
  constraint tickr_orders_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint tickr_orders_buyer_name_length check (char_length(buyer_name) between 1 and 100),
  constraint tickr_orders_buyer_email_length check (char_length(buyer_email) between 3 and 320),
  unique (id, event_id)
);

create unique index if not exists tickr_orders_payment_reference_key
  on public.tickr_orders (payment_provider, payment_reference)
  where payment_reference is not null;
create index if not exists tickr_orders_buyer_idx
  on public.tickr_orders (buyer_id, created_at desc);
create index if not exists tickr_orders_event_idx
  on public.tickr_orders (event_id, status, created_at desc);

create table if not exists public.tickr_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  event_id uuid not null references public.tickr_events(id) on delete restrict,
  ticket_type_id uuid not null,
  ticket_name text not null,
  quantity integer not null,
  unit_price numeric(14, 2) not null,
  created_at timestamptz not null default now(),
  constraint tickr_order_items_quantity_positive check (quantity between 1 and 100),
  constraint tickr_order_items_price_nonnegative check (unit_price >= 0),
  foreign key (order_id, event_id)
    references public.tickr_orders(id, event_id) on delete restrict,
  foreign key (ticket_type_id, event_id)
    references public.tickr_ticket_types(id, event_id) on delete restrict,
  unique (id, event_id)
);

create index if not exists tickr_order_items_order_idx
  on public.tickr_order_items (order_id);

create table if not exists public.tickr_tickets (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null,
  event_id uuid not null references public.tickr_events(id) on delete restrict,
  owner_id uuid references public.tickr_profiles(id) on delete set null,
  qr_token_hash text not null unique,
  status public.tickr_ticket_status not null default 'valid',
  checked_in_at timestamptz,
  checked_in_by uuid references public.tickr_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint tickr_tickets_qr_hash_format check (qr_token_hash ~ '^[a-f0-9]{64}$'),
  constraint tickr_tickets_check_in_state
    check ((status = 'used') = (checked_in_at is not null)),
  foreign key (order_item_id, event_id)
    references public.tickr_order_items(id, event_id) on delete restrict
);

create index if not exists tickr_tickets_owner_idx
  on public.tickr_tickets (owner_id, created_at desc);
create index if not exists tickr_tickets_event_status_idx
  on public.tickr_tickets (event_id, status);

create table if not exists public.tickr_comments (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  content_id uuid not null,
  author_id uuid not null references public.tickr_profiles(id) on delete cascade,
  parent_id uuid references public.tickr_comments(id) on delete cascade,
  body text not null,
  status public.tickr_comment_status not null default 'visible',
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickr_comments_content_type check (content_type in ('event', 'profile')),
  constraint tickr_comments_body_length check (char_length(body) between 1 and 500),
  constraint tickr_comments_not_self_parent check (parent_id is null or parent_id <> id)
);

create index if not exists tickr_comments_content_idx
  on public.tickr_comments (content_type, content_id, created_at);
create index if not exists tickr_comments_parent_idx
  on public.tickr_comments (parent_id);

create table if not exists public.tickr_comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.tickr_comments(id) on delete cascade,
  reporter_id uuid not null references public.tickr_profiles(id) on delete cascade,
  reason text not null,
  status text not null default 'open',
  moderator_id uuid references public.tickr_profiles(id) on delete set null,
  decision_note text not null default '',
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  constraint tickr_reports_reason_length check (char_length(reason) between 3 and 1000),
  constraint tickr_reports_status check (status in ('open', 'reviewed', 'dismissed')),
  unique (comment_id, reporter_id)
);

create index if not exists tickr_comment_reports_queue_idx
  on public.tickr_comment_reports (status, created_at);

create table if not exists public.tickr_ratings (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid not null,
  author_id uuid not null references public.tickr_profiles(id) on delete cascade,
  rating smallint not null,
  body text not null,
  status public.tickr_comment_status not null default 'visible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickr_ratings_target_type check (target_type in ('event', 'profile')),
  constraint tickr_ratings_value check (rating between 1 and 5),
  constraint tickr_ratings_body_length check (char_length(body) between 1 and 500)
);

create unique index if not exists tickr_ratings_one_per_target
  on public.tickr_ratings (author_id, target_type, target_id);
create index if not exists tickr_ratings_target_idx
  on public.tickr_ratings (target_type, target_id, created_at desc);

create table if not exists public.tickr_event_stars (
  event_id uuid not null references public.tickr_events(id) on delete cascade,
  user_id uuid not null references public.tickr_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table if not exists public.tickr_sponsor_inquiries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.tickr_events(id) on delete cascade,
  sender_id uuid references public.tickr_profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text not null default '',
  social_url text not null default '',
  presentation text not null,
  status public.tickr_sponsor_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickr_sponsor_name_length check (char_length(name) between 1 and 100),
  constraint tickr_sponsor_email_length check (char_length(email) between 3 and 320),
  constraint tickr_sponsor_presentation_length check (char_length(presentation) between 10 and 5000)
);

create index if not exists tickr_sponsor_inquiries_event_idx
  on public.tickr_sponsor_inquiries (event_id, status, created_at desc);
create index if not exists tickr_sponsor_inquiries_sender_idx
  on public.tickr_sponsor_inquiries (sender_id, created_at desc);

create table if not exists public.tickr_activity_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.tickr_profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint tickr_activity_action_length check (char_length(action) between 1 and 100),
  constraint tickr_activity_entity_length check (char_length(entity_type) between 1 and 50)
);

create index if not exists tickr_activity_log_created_idx
  on public.tickr_activity_log (created_at desc);
create index if not exists tickr_activity_log_entity_idx
  on public.tickr_activity_log (entity_type, entity_id, created_at desc);

create or replace function public.tickr_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.tickr_has_role(p_role public.tickr_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.tickr_user_roles as user_role
    join public.tickr_profiles as profile on profile.id = user_role.user_id
    where user_role.user_id = auth.uid()
      and user_role.role = p_role
      and profile.disabled_at is null
  );
$$;

create or replace function public.tickr_can_manage_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.tickr_has_role('admin')
    or exists (
      select 1
      from public.tickr_events as event
      where event.id = p_event_id
        and event.owner_id = auth.uid()
        and public.tickr_has_role('organizer')
    )
    or exists (
      select 1
      from public.tickr_event_staff as staff
      join public.tickr_profiles as profile on profile.id = staff.user_id
      where staff.event_id = p_event_id
        and staff.user_id = auth.uid()
        and staff.role = 'manager'
        and profile.disabled_at is null
    );
$$;

create or replace function public.tickr_can_scan_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.tickr_can_manage_event(p_event_id)
    or exists (
      select 1
      from public.tickr_event_staff as staff
      join public.tickr_profiles as profile on profile.id = staff.user_id
      where staff.event_id = p_event_id
        and staff.user_id = auth.uid()
        and staff.role = 'scanner'
        and profile.disabled_at is null
    );
$$;

create or replace function public.tickr_content_is_public(p_type text, p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case p_type
    when 'event' then exists (
      select 1 from public.tickr_events
      where id = p_id and status = 'published'
    )
    when 'profile' then exists (
      select 1 from public.tickr_profiles
      where id = p_id and public_profile and disabled_at is null
    )
    else false
  end;
$$;

create or replace function public.tickr_can_rate_event(p_event_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.tickr_tickets as ticket
    join public.tickr_order_items as item on item.id = ticket.order_item_id
    join public.tickr_orders as purchase_order on purchase_order.id = item.order_id
    where ticket.event_id = p_event_id
      and ticket.owner_id = p_user_id
      and ticket.status in ('valid', 'used')
      and purchase_order.status = 'paid'
  );
$$;

create or replace function public.tickr_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_profile text := new.raw_user_meta_data ->> 'business_profile';
begin
  insert into public.tickr_profiles (id, full_name, business_profile)
  values (
    new.id,
    left(
      coalesce(
        nullif(new.raw_user_meta_data ->> 'name', ''),
        split_part(coalesce(new.email, ''), '@', 1),
        ''
      ),
      100
    ),
    case selected_profile
      when 'organizer' then 'organizer'::public.tickr_business_profile
      when 'service_provider' then 'service_provider'::public.tickr_business_profile
      else null
    end
  )
  on conflict (id) do nothing;

  insert into public.tickr_account_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.tickr_user_roles (user_id, role)
  values (new.id, 'member')
  on conflict (user_id, role) do nothing;

  if selected_profile in ('organizer', 'service_provider') then
    insert into public.tickr_user_roles (user_id, role)
    values (new.id, selected_profile::public.tickr_role)
    on conflict (user_id, role) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists tickr_auth_user_created on auth.users;
create trigger tickr_auth_user_created
  after insert on auth.users
  for each row execute function public.tickr_handle_new_user();

insert into public.tickr_profiles (id, full_name, business_profile)
select
  auth_user.id,
  left(
    coalesce(
      nullif(auth_user.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(auth_user.email, ''), '@', 1),
      ''
    ),
    100
  ),
  case auth_user.raw_user_meta_data ->> 'business_profile'
    when 'organizer' then 'organizer'::public.tickr_business_profile
    when 'service_provider' then 'service_provider'::public.tickr_business_profile
    else null
  end
from auth.users as auth_user
on conflict (id) do nothing;

insert into public.tickr_account_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;

insert into public.tickr_user_roles (user_id, role)
select id, 'member'::public.tickr_role from auth.users
on conflict (user_id, role) do nothing;

insert into public.tickr_user_roles (user_id, role)
select
  id,
  case raw_user_meta_data ->> 'business_profile'
    when 'organizer' then 'organizer'::public.tickr_role
    when 'service_provider' then 'service_provider'::public.tickr_role
  end
from auth.users
where raw_user_meta_data ->> 'business_profile' in ('organizer', 'service_provider')
on conflict (user_id, role) do nothing;

create or replace function public.tickr_validate_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parent public.tickr_comments%rowtype;
begin
  if tg_op = 'UPDATE' then
    if new.content_type <> old.content_type
      or new.content_id <> old.content_id
      or new.author_id <> old.author_id
      or new.parent_id is distinct from old.parent_id then
      raise exception 'O destino e a autoria do comentário não podem ser alterados.';
    end if;
    new.edited_at := now();
  end if;

  if not public.tickr_content_is_public(new.content_type, new.content_id)
    and not public.tickr_can_manage_event(new.content_id)
    and new.status <> 'removed' then
    raise exception 'O conteúdo não existe ou não está disponível.';
  end if;

  if new.parent_id is not null then
    select * into parent
    from public.tickr_comments
    where id = new.parent_id;

    if not found
      or parent.content_type <> new.content_type
      or parent.content_id <> new.content_id
      or (parent.status <> 'visible' and new.status <> 'removed')
      or parent.parent_id is not null then
      raise exception 'A resposta deve apontar para um comentário principal do mesmo conteúdo.';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.tickr_validate_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
    and (new.target_type <> old.target_type
      or new.target_id <> old.target_id
      or new.author_id <> old.author_id) then
    raise exception 'O destino e a autoria da avaliação não podem ser alterados.';
  end if;

  if not public.tickr_content_is_public(new.target_type, new.target_id) then
    raise exception 'O conteúdo não existe ou não está disponível.';
  end if;

  if new.target_type = 'event'
    and not public.tickr_can_rate_event(new.target_id, new.author_id) then
    raise exception 'É necessário ter um ingresso válido para avaliar este evento.';
  end if;

  return new;
end;
$$;

create or replace function public.tickr_guard_event_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'pending_review')
      and not public.tickr_has_role('admin')
      and session_user not in ('postgres', 'supabase_admin') then
      raise exception 'Um evento novo tem de começar como rascunho ou em revisão.';
    end if;
    if new.status = 'pending_review'
      and not (
        new.owner_id = auth.uid()
        and public.tickr_has_role('organizer')
      )
      and not public.tickr_has_role('admin')
      and session_user not in ('postgres', 'supabase_admin') then
      raise exception 'Não tens permissão para enviar este evento para revisão.';
    end if;
    return new;
  end if;

  if new.owner_id <> old.owner_id and not public.tickr_has_role('admin') then
    raise exception 'O organizador do evento não pode ser alterado.';
  end if;

  if new.status is distinct from old.status and not public.tickr_has_role('admin') then
    if not (
      old.owner_id = auth.uid()
      and public.tickr_has_role('organizer')
      and (
        (old.status in ('draft', 'rejected') and new.status = 'pending_review')
        or (old.status = 'published' and new.status = 'cancelled')
      )
    ) then
      raise exception 'Não tens permissão para alterar o estado deste evento.';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.tickr_set_role(
  p_user_id uuid,
  p_role public.tickr_role,
  p_enabled boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  admin_count integer;
begin
  if not public.tickr_has_role('admin') then
    raise exception 'Apenas administradores podem gerir funções.';
  end if;

  if p_role = 'admin' and not p_enabled then
    lock table public.tickr_user_roles in share row exclusive mode;
    select count(*) into admin_count
    from public.tickr_user_roles as user_role
    join public.tickr_profiles as profile on profile.id = user_role.user_id
    where user_role.role = 'admin' and profile.disabled_at is null;
    if admin_count <= 1 then
      raise exception 'Não é possível remover o último administrador.';
    end if;
  end if;

  if p_enabled then
    insert into public.tickr_user_roles (user_id, role, granted_by)
    values (p_user_id, p_role, auth.uid())
    on conflict (user_id, role) do nothing;
  else
    delete from public.tickr_user_roles
    where user_id = p_user_id and role = p_role;
  end if;

  insert into public.tickr_activity_log (actor_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    case when p_enabled then 'role.granted' else 'role.revoked' end,
    'user',
    p_user_id,
    jsonb_build_object('role', p_role)
  );
end;
$$;

create or replace function public.tickr_review_event(
  p_event_id uuid,
  p_status public.tickr_event_status,
  p_note text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.tickr_has_role('admin') then
    raise exception 'Apenas administradores podem rever eventos.';
  end if;
  if p_status not in ('published', 'rejected', 'cancelled') then
    raise exception 'Estado de revisão inválido.';
  end if;

  update public.tickr_events
  set status = p_status, review_note = left(coalesce(p_note, ''), 1000)
  where id = p_event_id;
  if not found then
    raise exception 'Evento não encontrado.';
  end if;

  insert into public.tickr_activity_log (actor_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    'event.reviewed',
    'event',
    p_event_id,
    jsonb_build_object('status', p_status, 'note', left(coalesce(p_note, ''), 1000))
  );
end;
$$;

create or replace function public.tickr_moderate_comment(
  p_comment_id uuid,
  p_status public.tickr_comment_status,
  p_note text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (public.tickr_has_role('moderator') or public.tickr_has_role('admin')) then
    raise exception 'Apenas moderadores podem alterar o estado de comentários.';
  end if;

  update public.tickr_comments
  set status = p_status
  where id = p_comment_id;
  if not found then
    raise exception 'Comentário não encontrado.';
  end if;

  update public.tickr_comment_reports
  set status = case when p_status = 'visible' then 'dismissed' else 'reviewed' end,
      moderator_id = auth.uid(),
      decision_note = left(coalesce(p_note, ''), 1000),
      decided_at = now()
  where comment_id = p_comment_id and status = 'open';

  insert into public.tickr_activity_log (actor_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    'comment.moderated',
    'comment',
    p_comment_id,
    jsonb_build_object('status', p_status, 'note', left(coalesce(p_note, ''), 1000))
  );
end;
$$;

create or replace function public.tickr_delete_comment(p_comment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.tickr_comments
  set status = 'removed'
  where id = p_comment_id
    and (
      author_id = auth.uid()
      or public.tickr_has_role('moderator')
      or public.tickr_has_role('admin')
    );

  if not found then
    raise exception 'Comentário não encontrado ou sem permissão para remover.';
  end if;

  insert into public.tickr_activity_log (actor_id, action, entity_type, entity_id)
  values (auth.uid(), 'comment.removed', 'comment', p_comment_id);
end;
$$;

create or replace function public.tickr_check_in_ticket(p_qr_token_hash text)
returns table (ticket_id uuid, event_id uuid, checked_in_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  ticket public.tickr_tickets%rowtype;
  checkin_time timestamptz := now();
begin
  select * into ticket
  from public.tickr_tickets
  where qr_token_hash = p_qr_token_hash
  for update;

  if not found or not public.tickr_can_scan_event(ticket.event_id) then
    raise exception 'Ingresso inválido ou sem permissão para validar.';
  end if;
  if ticket.status <> 'valid' then
    raise exception 'Este ingresso já foi utilizado ou não é válido.';
  end if;
  if not exists (
    select 1
    from public.tickr_order_items as item
    join public.tickr_orders as purchase_order on purchase_order.id = item.order_id
    join public.tickr_events as event on event.id = ticket.event_id
    where item.id = ticket.order_item_id
      and purchase_order.status = 'paid'
      and event.status = 'published'
  ) then
    raise exception 'O pedido não foi pago ou o evento não está publicado.';
  end if;

  update public.tickr_tickets
  set status = 'used', checked_in_at = checkin_time, checked_in_by = auth.uid()
  where id = ticket.id;

  insert into public.tickr_activity_log (actor_id, action, entity_type, entity_id)
  values (auth.uid(), 'ticket.checked_in', 'ticket', ticket.id);

  return query select ticket.id, ticket.event_id, checkin_time;
end;
$$;

create or replace function public.tickr_submit_event_for_review(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.tickr_events
  set status = 'pending_review'
  where id = p_event_id
    and owner_id = auth.uid()
    and status in ('draft', 'rejected')
    and public.tickr_has_role('organizer');

  if not found then
    raise exception 'Evento não encontrado ou não pode ser enviado para revisão.';
  end if;

  insert into public.tickr_activity_log (actor_id, action, entity_type, entity_id)
  values (auth.uid(), 'event.submitted', 'event', p_event_id);
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'tickr_profiles',
    'tickr_account_preferences',
    'tickr_events',
    'tickr_ticket_types',
    'tickr_orders',
    'tickr_comments',
    'tickr_ratings',
    'tickr_sponsor_inquiries'
  ] loop
    execute format('drop trigger if exists tickr_touch_updated_at on public.%I', table_name);
    execute format(
      'create trigger tickr_touch_updated_at before update on public.%I for each row execute function public.tickr_touch_updated_at()',
      table_name
    );
  end loop;
end;
$$;

drop trigger if exists tickr_guard_event_status on public.tickr_events;
create trigger tickr_guard_event_status
  before insert or update on public.tickr_events
  for each row execute function public.tickr_guard_event_status();

drop trigger if exists tickr_validate_comment on public.tickr_comments;
create trigger tickr_validate_comment
  before insert or update on public.tickr_comments
  for each row execute function public.tickr_validate_comment();

drop trigger if exists tickr_validate_rating on public.tickr_ratings;
create trigger tickr_validate_rating
  before insert or update on public.tickr_ratings
  for each row execute function public.tickr_validate_rating();

alter table public.tickr_profiles enable row level security;
alter table public.tickr_user_roles enable row level security;
alter table public.tickr_account_preferences enable row level security;
alter table public.tickr_events enable row level security;
alter table public.tickr_event_staff enable row level security;
alter table public.tickr_ticket_types enable row level security;
alter table public.tickr_orders enable row level security;
alter table public.tickr_order_items enable row level security;
alter table public.tickr_tickets enable row level security;
alter table public.tickr_comments enable row level security;
alter table public.tickr_comment_reports enable row level security;
alter table public.tickr_ratings enable row level security;
alter table public.tickr_event_stars enable row level security;
alter table public.tickr_sponsor_inquiries enable row level security;
alter table public.tickr_activity_log enable row level security;

drop policy if exists tickr_profiles_read_public on public.tickr_profiles;
create policy tickr_profiles_read_public on public.tickr_profiles
  for select to anon, authenticated
  using ((public_profile and disabled_at is null) or id = auth.uid() or public.tickr_has_role('admin'));
drop policy if exists tickr_profiles_update_self on public.tickr_profiles;
create policy tickr_profiles_update_self on public.tickr_profiles
  for update to authenticated
  using (id = auth.uid() and disabled_at is null)
  with check (id = auth.uid() and disabled_at is null);

drop policy if exists tickr_roles_read_self_or_admin on public.tickr_user_roles;
create policy tickr_roles_read_self_or_admin on public.tickr_user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.tickr_has_role('admin'));

drop policy if exists tickr_preferences_read_self on public.tickr_account_preferences;
create policy tickr_preferences_read_self on public.tickr_account_preferences
  for select to authenticated using (user_id = auth.uid());
drop policy if exists tickr_preferences_update_self on public.tickr_account_preferences;
create policy tickr_preferences_update_self on public.tickr_account_preferences
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists tickr_events_read on public.tickr_events;
create policy tickr_events_read on public.tickr_events
  for select to anon, authenticated
  using (
    status = 'published'
    or owner_id = auth.uid()
    or public.tickr_has_role('admin')
    or public.tickr_can_scan_event(id)
  );
drop policy if exists tickr_events_create on public.tickr_events;
create policy tickr_events_create on public.tickr_events
  for insert to authenticated
  with check (owner_id = auth.uid() and public.tickr_has_role('organizer'));
drop policy if exists tickr_events_update_owner on public.tickr_events;
create policy tickr_events_update_owner on public.tickr_events
  for update to authenticated
  using ((owner_id = auth.uid() and public.tickr_has_role('organizer')) or public.tickr_has_role('admin'))
  with check ((owner_id = auth.uid() and public.tickr_has_role('organizer')) or public.tickr_has_role('admin'));
drop policy if exists tickr_events_delete_owner on public.tickr_events;
create policy tickr_events_delete_owner on public.tickr_events
  for delete to authenticated
  using ((owner_id = auth.uid() and status = 'draft') or public.tickr_has_role('admin'));

drop policy if exists tickr_staff_read_event on public.tickr_event_staff;
create policy tickr_staff_read_event on public.tickr_event_staff
  for select to authenticated
  using (user_id = auth.uid() or public.tickr_can_manage_event(event_id));
drop policy if exists tickr_staff_manage_event on public.tickr_event_staff;
create policy tickr_staff_manage_event on public.tickr_event_staff
  for all to authenticated
  using (
    exists (select 1 from public.tickr_events e where e.id = event_id and e.owner_id = auth.uid())
    or public.tickr_has_role('admin')
  )
  with check (
    (
      exists (select 1 from public.tickr_events e where e.id = event_id and e.owner_id = auth.uid())
      and granted_by = auth.uid()
    )
    or public.tickr_has_role('admin')
  );

drop policy if exists tickr_ticket_types_read on public.tickr_ticket_types;
create policy tickr_ticket_types_read on public.tickr_ticket_types
  for select to anon, authenticated
  using (
    (active and exists (
      select 1 from public.tickr_events e
      where e.id = event_id and e.status = 'published'
    ))
    or public.tickr_can_manage_event(event_id)
  );
drop policy if exists tickr_ticket_types_manage on public.tickr_ticket_types;
create policy tickr_ticket_types_manage on public.tickr_ticket_types
  for all to authenticated
  using (public.tickr_can_manage_event(event_id))
  with check (public.tickr_can_manage_event(event_id));

drop policy if exists tickr_orders_read on public.tickr_orders;
create policy tickr_orders_read on public.tickr_orders
  for select to authenticated
  using (buyer_id = auth.uid() or public.tickr_can_manage_event(event_id));
drop policy if exists tickr_order_items_read on public.tickr_order_items;
create policy tickr_order_items_read on public.tickr_order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.tickr_orders o
      where o.id = order_id
        and (o.buyer_id = auth.uid() or public.tickr_can_manage_event(o.event_id))
    )
  );
drop policy if exists tickr_tickets_read on public.tickr_tickets;
create policy tickr_tickets_read on public.tickr_tickets
  for select to authenticated
  using (owner_id = auth.uid() or public.tickr_can_manage_event(event_id));

drop policy if exists tickr_comments_read on public.tickr_comments;
create policy tickr_comments_read on public.tickr_comments
  for select to anon, authenticated
  using (
    (status = 'visible' and public.tickr_content_is_public(content_type, content_id))
    or author_id = auth.uid()
    or public.tickr_has_role('moderator')
    or public.tickr_has_role('admin')
  );
drop policy if exists tickr_comments_create on public.tickr_comments;
create policy tickr_comments_create on public.tickr_comments
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and public.tickr_content_is_public(content_type, content_id)
  );
drop policy if exists tickr_comments_update_own on public.tickr_comments;
create policy tickr_comments_update_own on public.tickr_comments
  for update to authenticated
  using (author_id = auth.uid() and status = 'visible')
  with check (author_id = auth.uid() and status = 'visible');
drop policy if exists tickr_comments_delete_own on public.tickr_comments;

drop policy if exists tickr_reports_create on public.tickr_comment_reports;
create policy tickr_reports_create on public.tickr_comment_reports
  for insert to authenticated
  with check (
    reporter_id = auth.uid()
    and exists (
      select 1
      from public.tickr_comments as comment
      where comment.id = comment_id
        and comment.author_id <> auth.uid()
        and comment.status = 'visible'
    )
  );
drop policy if exists tickr_reports_read_own_or_moderator on public.tickr_comment_reports;
create policy tickr_reports_read_own_or_moderator on public.tickr_comment_reports
  for select to authenticated
  using (reporter_id = auth.uid() or public.tickr_has_role('moderator') or public.tickr_has_role('admin'));

drop policy if exists tickr_ratings_read on public.tickr_ratings;
create policy tickr_ratings_read on public.tickr_ratings
  for select to anon, authenticated
  using (
    (status = 'visible' and public.tickr_content_is_public(target_type, target_id))
    or author_id = auth.uid()
    or public.tickr_has_role('moderator')
    or public.tickr_has_role('admin')
  );
drop policy if exists tickr_ratings_create on public.tickr_ratings;
create policy tickr_ratings_create on public.tickr_ratings
  for insert to authenticated
  with check (author_id = auth.uid() and public.tickr_content_is_public(target_type, target_id));
drop policy if exists tickr_ratings_update_own on public.tickr_ratings;
create policy tickr_ratings_update_own on public.tickr_ratings
  for update to authenticated
  using (author_id = auth.uid() and status = 'visible')
  with check (author_id = auth.uid() and status = 'visible');
drop policy if exists tickr_ratings_delete_own on public.tickr_ratings;
create policy tickr_ratings_delete_own on public.tickr_ratings
  for delete to authenticated
  using (author_id = auth.uid() or public.tickr_has_role('moderator') or public.tickr_has_role('admin'));

drop policy if exists tickr_stars_read on public.tickr_event_stars;
create policy tickr_stars_read on public.tickr_event_stars
  for select to anon, authenticated
  using (public.tickr_content_is_public('event', event_id) or user_id = auth.uid());
drop policy if exists tickr_stars_insert_own on public.tickr_event_stars;
create policy tickr_stars_insert_own on public.tickr_event_stars
  for insert to authenticated
  with check (user_id = auth.uid() and public.tickr_content_is_public('event', event_id));
drop policy if exists tickr_stars_delete_own on public.tickr_event_stars;
create policy tickr_stars_delete_own on public.tickr_event_stars
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists tickr_sponsors_read on public.tickr_sponsor_inquiries;
create policy tickr_sponsors_read on public.tickr_sponsor_inquiries
  for select to authenticated
  using (sender_id = auth.uid() or public.tickr_can_manage_event(event_id));
drop policy if exists tickr_sponsors_create on public.tickr_sponsor_inquiries;
create policy tickr_sponsors_create on public.tickr_sponsor_inquiries
  for insert to authenticated
  with check (
    (sender_id = auth.uid() or sender_id is null)
    and public.tickr_content_is_public('event', event_id)
  );
drop policy if exists tickr_sponsors_update on public.tickr_sponsor_inquiries;
create policy tickr_sponsors_update on public.tickr_sponsor_inquiries
  for update to authenticated
  using (public.tickr_can_manage_event(event_id))
  with check (public.tickr_can_manage_event(event_id));

drop policy if exists tickr_activity_admin_read on public.tickr_activity_log;
create policy tickr_activity_admin_read on public.tickr_activity_log
  for select to authenticated using (public.tickr_has_role('admin'));

revoke all on public.tickr_profiles from anon, authenticated;
grant select on public.tickr_profiles to anon, authenticated;
grant update (
  username, full_name, avatar_url, bio, location,
  instagram, linkedin, website, whatsapp, public_profile
) on public.tickr_profiles to authenticated;

revoke all on public.tickr_user_roles from anon, authenticated;
grant select on public.tickr_user_roles to authenticated;

revoke all on public.tickr_account_preferences from anon, authenticated;
grant select on public.tickr_account_preferences to authenticated;
grant update (notifications_enabled, preferred_language, theme)
  on public.tickr_account_preferences to authenticated;

revoke all on public.tickr_events from anon, authenticated;
grant select on public.tickr_events to anon, authenticated;
grant insert on public.tickr_events to authenticated;
grant update (
  title, slug, category, description, starts_at, ends_at, city, venue, address,
  image_url, age_restriction, rules, contact_name, whatsapp, currency
) on public.tickr_events to authenticated;
grant delete on public.tickr_events to authenticated;

revoke all on public.tickr_event_staff from anon, authenticated;
grant select, insert, update, delete on public.tickr_event_staff to authenticated;

revoke all on public.tickr_ticket_types from anon, authenticated;
grant select on public.tickr_ticket_types to anon, authenticated;
grant insert, update, delete on public.tickr_ticket_types to authenticated;

revoke all on public.tickr_orders from anon, authenticated;
grant select on public.tickr_orders to authenticated;
revoke all on public.tickr_order_items from anon, authenticated;
grant select on public.tickr_order_items to authenticated;
revoke all on public.tickr_tickets from anon, authenticated;
grant select on public.tickr_tickets to authenticated;

revoke all on public.tickr_comments from anon, authenticated;
grant select on public.tickr_comments to anon, authenticated;
grant insert on public.tickr_comments to authenticated;
grant update (body) on public.tickr_comments to authenticated;

revoke all on public.tickr_comment_reports from anon, authenticated;
grant select on public.tickr_comment_reports to authenticated;
grant insert (comment_id, reporter_id, reason) on public.tickr_comment_reports to authenticated;

revoke all on public.tickr_ratings from anon, authenticated;
grant select on public.tickr_ratings to anon, authenticated;
grant insert (target_type, target_id, author_id, rating, body) on public.tickr_ratings to authenticated;
grant update (rating, body) on public.tickr_ratings to authenticated;
grant delete on public.tickr_ratings to authenticated;

revoke all on public.tickr_event_stars from anon, authenticated;
grant select on public.tickr_event_stars to anon, authenticated;
grant insert (event_id, user_id) on public.tickr_event_stars to authenticated;
grant delete on public.tickr_event_stars to authenticated;

revoke all on public.tickr_sponsor_inquiries from anon, authenticated;
grant select on public.tickr_sponsor_inquiries to authenticated;
grant insert (event_id, sender_id, name, email, phone, social_url, presentation)
  on public.tickr_sponsor_inquiries to authenticated;
grant update (status) on public.tickr_sponsor_inquiries to authenticated;

revoke all on public.tickr_activity_log from anon, authenticated;
grant select on public.tickr_activity_log to authenticated;
revoke all on function public.tickr_touch_updated_at() from public, anon, authenticated;
revoke all on function public.tickr_handle_new_user() from public, anon, authenticated;
revoke all on function public.tickr_validate_comment() from public, anon, authenticated;
revoke all on function public.tickr_validate_rating() from public, anon, authenticated;
revoke all on function public.tickr_guard_event_status() from public, anon, authenticated;

revoke all on function public.tickr_has_role(public.tickr_role) from public;
grant execute on function public.tickr_has_role(public.tickr_role) to anon, authenticated;
revoke all on function public.tickr_can_manage_event(uuid) from public;
grant execute on function public.tickr_can_manage_event(uuid) to anon, authenticated;
revoke all on function public.tickr_can_scan_event(uuid) from public;
grant execute on function public.tickr_can_scan_event(uuid) to anon, authenticated;
revoke all on function public.tickr_content_is_public(text, uuid) from public;
grant execute on function public.tickr_content_is_public(text, uuid) to anon, authenticated;
revoke all on function public.tickr_can_rate_event(uuid, uuid) from public;

revoke all on function public.tickr_set_role(uuid, public.tickr_role, boolean) from public, anon;
grant execute on function public.tickr_set_role(uuid, public.tickr_role, boolean) to authenticated;
revoke all on function public.tickr_review_event(uuid, public.tickr_event_status, text) from public, anon;
grant execute on function public.tickr_review_event(uuid, public.tickr_event_status, text) to authenticated;
revoke all on function public.tickr_check_in_ticket(text) from public, anon;
grant execute on function public.tickr_check_in_ticket(text) to authenticated;
revoke all on function public.tickr_submit_event_for_review(uuid) from public, anon;
grant execute on function public.tickr_submit_event_for_review(uuid) to authenticated;
revoke all on function public.tickr_moderate_comment(uuid, public.tickr_comment_status, text) from public, anon;
grant execute on function public.tickr_moderate_comment(uuid, public.tickr_comment_status, text) to authenticated;
revoke all on function public.tickr_delete_comment(uuid) from public, anon;
grant execute on function public.tickr_delete_comment(uuid) to authenticated;

notify pgrst, 'reload schema';
