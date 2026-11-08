do $$
declare
  tickr_user_id uuid;
begin
  select auth_user.id into tickr_user_id
  from auth.users as auth_user
  where lower(auth_user.email) = lower('REPLACE_WITH_TICKR_ACCOUNT_EMAIL')
  limit 1;

  if tickr_user_id is null then
    raise exception 'Cria primeiro a conta oficial Tickr Eventos e substitui o email neste SQL.';
  end if;

  update public.tickr_profiles
  set full_name = 'Tickr Eventos',
      username = 'tickr.eventos',
      location = 'Luanda, Angola',
      business_profile = 'organizer'
  where id = tickr_user_id;

  insert into public.tickr_user_roles (user_id, role)
  values (tickr_user_id, 'organizer')
  on conflict (user_id, role) do nothing;

  insert into public.tickr_user_roles (user_id, role)
  values (tickr_user_id, 'admin')
  on conflict (user_id, role) do nothing;

  perform set_config('request.jwt.claim.sub', tickr_user_id::text, true);

  if exists (
    select 1
    from public.tickr_events
    where slug in ('ninho-live', 'semba-raizes', 'afro-beats-night', 'tech-summit')
      and owner_id <> tickr_user_id
  ) then
    raise exception 'Um evento de demonstração já existe associado a outro perfil; revê os dados antes de continuar.';
  end if;

  insert into public.tickr_events (
    id, owner_id, title, slug, category, description, status, starts_at,
    city, venue, age_restriction
  )
  values
    (
      (
        substr(md5('tickr-demo:ninho-live'), 1, 8) || '-' ||
        substr(md5('tickr-demo:ninho-live'), 9, 4) || '-' ||
        substr(md5('tickr-demo:ninho-live'), 13, 4) || '-' ||
        substr(md5('tickr-demo:ninho-live'), 17, 4) || '-' ||
        substr(md5('tickr-demo:ninho-live'), 21, 12)
      )::uuid,
      tickr_user_id,
      'Ninho Live in Luanda',
      'ninho-live',
      'MÚSICA',
      'O maior artista da nova geração francesa chega a Luanda para um espetáculo inesquecível. Prepare-se para uma noite de emoções, hits e muita energia!',
      'published',
      '2025-07-18 20:00:00 Africa/Luanda',
      'Luanda',
      'Palácio de Congressos',
      'Livre'
    ),
    (
      (
        substr(md5('tickr-demo:semba-raizes'), 1, 8) || '-' ||
        substr(md5('tickr-demo:semba-raizes'), 9, 4) || '-' ||
        substr(md5('tickr-demo:semba-raizes'), 13, 4) || '-' ||
        substr(md5('tickr-demo:semba-raizes'), 17, 4) || '-' ||
        substr(md5('tickr-demo:semba-raizes'), 21, 12)
      )::uuid,
      tickr_user_id,
      'Semba & Raízes',
      'semba-raizes',
      'CULTURA',
      'Uma noite dedicada às raízes do semba, com mestres e novas vozes no mesmo palco.',
      'published',
      '2025-07-26 19:00:00 Africa/Luanda',
      'Luanda',
      'Cine Atlântico',
      'Livre'
    ),
    (
      (
        substr(md5('tickr-demo:afro-beats-night'), 1, 8) || '-' ||
        substr(md5('tickr-demo:afro-beats-night'), 9, 4) || '-' ||
        substr(md5('tickr-demo:afro-beats-night'), 13, 4) || '-' ||
        substr(md5('tickr-demo:afro-beats-night'), 17, 4) || '-' ||
        substr(md5('tickr-demo:afro-beats-night'), 21, 12)
      )::uuid,
      tickr_user_id,
      'Afro Beats Night',
      'afro-beats-night',
      'MÚSICA',
      'A melhor seleção afrobeats da cidade, com DJs residentes e convidados.',
      'published',
      '2025-07-26 22:00:00 Africa/Luanda',
      'Luanda',
      'Clube Naval',
      'Livre'
    ),
    (
      (
        substr(md5('tickr-demo:tech-summit'), 1, 8) || '-' ||
        substr(md5('tickr-demo:tech-summit'), 9, 4) || '-' ||
        substr(md5('tickr-demo:tech-summit'), 13, 4) || '-' ||
        substr(md5('tickr-demo:tech-summit'), 17, 4) || '-' ||
        substr(md5('tickr-demo:tech-summit'), 21, 12)
      )::uuid,
      tickr_user_id,
      'Tech & Business Summit',
      'tech-summit',
      'NEGÓCIOS',
      'Dois dias de painéis, networking e workshops com líderes de tecnologia e negócios.',
      'published',
      '2025-08-15 09:00:00 Africa/Luanda',
      'Luanda',
      'Talatona Convention Center',
      'Livre'
    )
  on conflict (slug) do nothing;
end;
$$;
