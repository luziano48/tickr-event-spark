alter table public.tickr_profiles
  add column if not exists contact_email text not null default '';

grant update (
  username, full_name, avatar_url, bio, location, contact_email,
  instagram, linkedin, website, whatsapp, public_profile
) on public.tickr_profiles to authenticated;

create table if not exists public.tickr_profile_legacy_imports (
  user_id uuid primary key references public.tickr_profiles(id) on delete cascade,
  source_profile jsonb not null,
  previous_profile jsonb not null,
  imported_at timestamptz not null default now()
);

alter table public.tickr_profile_legacy_imports enable row level security;

drop policy if exists tickr_profile_legacy_imports_read_self
  on public.tickr_profile_legacy_imports;
create policy tickr_profile_legacy_imports_read_self
  on public.tickr_profile_legacy_imports
  for select to authenticated
  using (user_id = auth.uid());

revoke all on public.tickr_profile_legacy_imports from anon, authenticated;
grant select on public.tickr_profile_legacy_imports to authenticated;

create or replace function public.tickr_import_legacy_profile(
  p_profile jsonb,
  p_avatar_url text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_profile public.tickr_profiles%rowtype;
  current_preferences public.tickr_account_preferences%rowtype;
begin
  if current_user_id is null then
    raise exception 'Inicia sessão para migrar o perfil.';
  end if;

  select *
    into current_profile
    from public.tickr_profiles
    where id = current_user_id
    for update;
  if not found then
    raise exception 'Perfil Supabase indisponível.';
  end if;

  if exists (
    select 1
      from public.tickr_profile_legacy_imports
      where user_id = current_user_id
  ) then
    return;
  end if;

  select *
    into current_preferences
    from public.tickr_account_preferences
    where user_id = current_user_id;

  insert into public.tickr_profile_legacy_imports (
    user_id,
    source_profile,
    previous_profile
  )
  values (
    current_user_id,
    p_profile,
    jsonb_build_object(
      'profile', to_jsonb(current_profile),
      'preferences', to_jsonb(current_preferences)
    )
  );

  update public.tickr_profiles
    set username = case
          when p_profile ? 'username'
            then nullif(regexp_replace(btrim(coalesce(p_profile ->> 'username', '')), '^@+', ''), '')
          else username
        end,
        full_name = case
          when p_profile ? 'name' then coalesce(p_profile ->> 'name', '')
          else full_name
        end,
        avatar_url = coalesce(p_avatar_url, avatar_url),
        bio = case when p_profile ? 'bio' then coalesce(p_profile ->> 'bio', '') else bio end,
        location = case
          when p_profile ? 'location' then coalesce(p_profile ->> 'location', '')
          else location
        end,
        contact_email = case
          when p_profile ? 'email' then coalesce(p_profile ->> 'email', '')
          else contact_email
        end,
        instagram = case
          when p_profile ? 'instagram' then coalesce(p_profile ->> 'instagram', '')
          else instagram
        end,
        linkedin = case
          when p_profile ? 'linkedin' then coalesce(p_profile ->> 'linkedin', '')
          else linkedin
        end,
        website = case
          when p_profile ? 'website' then coalesce(p_profile ->> 'website', '')
          else website
        end,
        whatsapp = case
          when p_profile ? 'whatsapp' then coalesce(p_profile ->> 'whatsapp', '')
          else whatsapp
        end,
        public_profile = case
          when jsonb_typeof(p_profile -> 'publicProfile') = 'boolean'
            then (p_profile ->> 'publicProfile')::boolean
          else public_profile
        end
    where id = current_user_id;

  if jsonb_typeof(p_profile -> 'notifications') = 'boolean' then
    update public.tickr_account_preferences
      set notifications_enabled = (p_profile ->> 'notifications')::boolean
      where user_id = current_user_id;
  end if;
end;
$$;

revoke all on function public.tickr_import_legacy_profile(jsonb, text)
  from public, anon, authenticated;
grant execute on function public.tickr_import_legacy_profile(jsonb, text)
  to authenticated;
