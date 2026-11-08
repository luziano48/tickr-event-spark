insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tickr-event-covers',
  'tickr-event-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists tickr_event_covers_public_read on storage.objects;
create policy tickr_event_covers_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'tickr-event-covers');

drop policy if exists tickr_event_covers_owner_insert on storage.objects;
create policy tickr_event_covers_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'tickr-event-covers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists tickr_event_covers_owner_delete on storage.objects;
create policy tickr_event_covers_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'tickr-event-covers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create or replace function public.tickr_create_event(p_event jsonb, p_tickets jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  event_row public.tickr_events%rowtype;
  profile_row public.tickr_profiles%rowtype;
  ticket jsonb;
begin
  if current_user_id is null then
    raise exception 'Inicia sessão para criar um evento.';
  end if;
  if not (
    public.tickr_has_role('organizer')
    or public.tickr_has_role('admin')
  ) then
    raise exception 'É necessário um perfil de organizador para criar eventos.';
  end if;
  if coalesce(jsonb_typeof(p_event) <> 'object', true)
    or coalesce(jsonb_typeof(p_tickets) <> 'array', true)
    or jsonb_array_length(p_tickets) not between 1 and 20 then
    raise exception 'Os dados do evento ou dos ingressos são inválidos.';
  end if;

  insert into public.tickr_events (
    owner_id, title, slug, category, description, status, starts_at,
    city, venue, address, image_url, age_restriction, rules, contact_name, whatsapp
  )
  values (
    current_user_id,
    p_event ->> 'title',
    p_event ->> 'slug',
    p_event ->> 'category',
    coalesce(p_event ->> 'description', ''),
    'draft',
    (p_event ->> 'starts_at')::timestamptz,
    p_event ->> 'city',
    p_event ->> 'venue',
    coalesce(p_event ->> 'address', ''),
    nullif(p_event ->> 'image_url', ''),
    coalesce(p_event ->> 'age_restriction', 'Livre'),
    coalesce(p_event ->> 'rules', ''),
    coalesce(p_event ->> 'contact_name', ''),
    coalesce(p_event ->> 'whatsapp', '')
  )
  returning * into event_row;

  for ticket in select value from jsonb_array_elements(p_tickets)
  loop
    if coalesce(jsonb_typeof(ticket) <> 'object', true)
      or coalesce(ticket ->> 'name', '') = ''
      or (ticket ->> 'price')::numeric < 0
      or (ticket ->> 'quantity')::integer < 1 then
      raise exception 'Um dos tipos de ingresso é inválido.';
    end if;

    insert into public.tickr_ticket_types (event_id, name, price, quantity)
    values (
      event_row.id,
      ticket ->> 'name',
      (ticket ->> 'price')::numeric,
      (ticket ->> 'quantity')::integer
    );
  end loop;

  perform public.tickr_submit_event_for_review(event_row.id);
  select * into event_row
  from public.tickr_events
  where id = event_row.id;

  select * into profile_row
  from public.tickr_profiles
  where id = current_user_id;

  return jsonb_build_object(
    'id', event_row.id,
    'slug', event_row.slug,
    'status', event_row.status,
    'ownerId', event_row.owner_id,
    'title', event_row.title,
    'imageUrl', event_row.image_url,
    'organizer', profile_row.full_name,
    'organizerUsername', coalesce('@' || profile_row.username, '@tickr.eventos'),
    'tickets', (
      select coalesce(
        jsonb_agg(jsonb_build_object(
          'name', created_ticket.name,
          'price', created_ticket.price,
          'quantity', created_ticket.quantity
        )),
        '[]'::jsonb
      )
      from public.tickr_ticket_types as created_ticket
      where created_ticket.event_id = event_row.id
    )
  );
end;
$$;

revoke all on function public.tickr_create_event(jsonb, jsonb) from public, anon;
grant execute on function public.tickr_create_event(jsonb, jsonb) to authenticated;

notify pgrst, 'reload schema';
