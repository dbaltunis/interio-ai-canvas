
-- 1) Presence: create a consistent view from user_profiles
create or replace view public.user_presence_view as
select
  up.user_id,
  case
    when up.is_online then 'online'
    when coalesce(up.has_logged_in, false) = false then 'never_logged_in'
    when now() - coalesce(up.last_seen, now() - interval '1 day') <= interval '5 minutes' then 'away'
    else 'offline'
  end as status,
  up.last_seen,
  up.display_name,
  up.avatar_url,
  up.role,
  up.status_message
from public.user_profiles up;

-- 2) Make sure realtime works for messaging and presence
alter table public.direct_messages replica identity full;
alter table public.user_profiles replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.direct_messages;
  exception when duplicate_object then
    null;
  end;

  begin
    alter publication supabase_realtime add table public.user_profiles;
  exception when duplicate_object then
    null;
  end;
end $$;

-- 3) Admin-manageable permissions on user_permissions
alter table public.user_permissions enable row level security;

-- View own or team permissions
drop policy if exists "Users can view their own or account permissions" on public.user_permissions;
create policy "Users can view their own or account permissions"
on public.user_permissions
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
  or public.get_account_owner(auth.uid()) = public.get_account_owner(user_id)
);

-- Grant permissions to team (insert)
drop policy if exists "Admins can grant permissions to team" on public.user_permissions;
create policy "Admins can grant permissions to team"
on public.user_permissions
for insert
to authenticated
with check (
  public.is_admin()
  and public.get_account_owner(auth.uid()) = public.get_account_owner(user_id)
);

-- Revoke permissions from team (delete)
drop policy if exists "Admins can revoke permissions from team" on public.user_permissions;
create policy "Admins can revoke permissions from team"
on public.user_permissions
for delete
to authenticated
using (
  public.is_admin()
  and public.get_account_owner(auth.uid()) = public.get_account_owner(user_id)
);

-- Audit trigger for permissions changes
drop trigger if exists trg_user_permissions_audit on public.user_permissions;
create trigger trg_user_permissions_audit
after insert or delete on public.user_permissions
for each row execute function public.log_permission_change();

-- 4) Team visibility and admin updates on user_profiles
alter table public.user_profiles enable row level security;

-- View team profiles within the same account (plus self, plus admins)
drop policy if exists "Users can view team profiles" on public.user_profiles;
create policy "Users can view team profiles"
on public.user_profiles
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
  or public.get_account_owner(auth.uid()) = public.get_account_owner(user_id)
);

-- Users can update their own profile
drop policy if exists "Users can update their own profile" on public.user_profiles;
create policy "Users can update their own profile"
on public.user_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Admins can update team profiles (role, active, parent_account_id, etc.)
drop policy if exists "Admins can manage team profiles" on public.user_profiles;
create policy "Admins can manage team profiles"
on public.user_profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 5) RPC to link a user to the admin's account (and seed default permissions)
create or replace function public.link_user_to_account(child_user_id uuid, parent_user_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  parent_id uuid := parent_user_id;
  child_role text;
begin
  if not public.is_admin() then
    raise exception 'Only admins can link users';
  end if;

  if parent_id is null then
    parent_id := public.get_account_owner(auth.uid());
  end if;

  update public.user_profiles
  set parent_account_id = parent_id,
      is_active = true,
      updated_at = now()
  where user_id = child_user_id;

  -- Seed default permissions if none exist
  if not exists (select 1 from public.user_permissions where user_id = child_user_id) then
    select role into child_role from public.user_profiles where user_id = child_user_id;
    if child_role is null then child_role := 'Staff'; end if;

    insert into public.user_permissions (user_id, permission_name, created_by)
    select child_user_id, perm, auth.uid()
    from unnest(public.get_default_permissions_for_role(child_role)) as perm
    on conflict do nothing;
  end if;

  return jsonb_build_object('success', true, 'parent_account_id', parent_id);
end;
$$;

-- 6) Helpful messaging indices
create index if not exists idx_direct_messages_participants_created_at
  on public.direct_messages (sender_id, recipient_id, created_at);
create index if not exists idx_direct_messages_recipient_unread
  on public.direct_messages (recipient_id, read_at);
