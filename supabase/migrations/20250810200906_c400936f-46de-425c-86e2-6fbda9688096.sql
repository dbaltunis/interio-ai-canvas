
-- 1) Replace the handle_new_user_profile function to upsert into public.user_profiles
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.user_profiles (
    user_id,
    display_name,
    is_active,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->> 'display_name', new.email),
    true,
    now(),
    now()
  )
  on conflict (user_id) do update
    set
      display_name = coalesce(public.user_profiles.display_name, excluded.display_name),
      is_active = true,
      updated_at = now();

  return new;
end;
$$;

-- 2) Recreate the trigger on auth.users to call the updated function (schema-qualified)
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

-- 3) Replace get_invitation_by_token to accept text and safely cast to uuid
drop function if exists public.get_invitation_by_token(uuid);

create or replace function public.get_invitation_by_token(invitation_token_param text)
returns table(
  invited_email text,
  invited_name text,
  role text,
  invited_by_name text,
  invited_by_email text,
  expires_at timestamptz,
  status text
)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare
  token_uuid uuid;
begin
  -- Safely cast; if bad token, return no rows (prevents 400s)
  begin
    token_uuid := invitation_token_param::uuid;
  exception when others then
    return;
  end;

  return query
  select
    ui.invited_email,
    ui.invited_name,
    ui.role,
    ui.invited_by_name,
    ui.invited_by_email,
    ui.expires_at,
    ui.status
  from public.user_invitations ui
  where ui.invitation_token = token_uuid
    and ui.status = 'pending'
    and ui.expires_at > now()
  limit 1;
end;
$$;

-- 4) Ensure an index on invitation_token for fast lookups (safe to run repeatedly)
create index if not exists user_invitations_invitation_token_idx
  on public.user_invitations (invitation_token);
