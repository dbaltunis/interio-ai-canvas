-- 1) Update accept_user_invitation to set parent_account_id and seed user_permissions
create or replace function public.accept_user_invitation(invitation_token_param text, user_id_param uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
    invitation_record record;
    inviter_id uuid;
    account_owner_id uuid;
    perm text;
    result jsonb;
begin
    -- Fetch invitation
    select * into invitation_record
    from public.user_invitations 
    where invitation_token = invitation_token_param::uuid
      and status = 'pending'
      and expires_at > now();

    if not found then
      return '{"success": false, "error": "Invalid or expired invitation"}'::jsonb;
    end if;

    -- Resolve inviter id (by email) and their account owner
    select id into inviter_id from auth.users where email = invitation_record.invited_by_email limit 1;
    if inviter_id is null then
      inviter_id := user_id_param; -- fallback
    end if;
    select public.get_account_owner(inviter_id) into account_owner_id;

    -- Upsert user profile, linking to inviter's account owner
    insert into public.user_profiles (
        user_id,
        display_name,
        role,
        permissions,
        is_active,
        parent_account_id
    ) values (
        user_id_param,
        coalesce(invitation_record.invited_name, invitation_record.invited_email),
        invitation_record.role,
        coalesce(invitation_record.permissions, '{}'::jsonb),
        true,
        account_owner_id
    )
    on conflict (user_id) do update set
        role = invitation_record.role,
        permissions = coalesce(invitation_record.permissions, '{}'::jsonb),
        is_active = true,
        parent_account_id = coalesce(public.user_profiles.parent_account_id, account_owner_id),
        display_name = coalesce(public.user_profiles.display_name, excluded.display_name);

    -- Seed user_permissions rows from invitation.permissions (jsonb array of text)
    if invitation_record.permissions is not null then
      delete from public.user_permissions where user_id = user_id_param; -- reset
      for perm in select jsonb_array_elements_text(invitation_record.permissions)
      loop
        insert into public.user_permissions (user_id, permission_name, created_by)
        values (user_id_param, perm, inviter_id)
        on conflict do nothing;
      end loop;
    end if;

    -- Mark invitation accepted
    update public.user_invitations
      set status = 'accepted', updated_at = now()
      where invitation_token = invitation_token_param::uuid;

    return jsonb_build_object(
      'success', true,
      'role', invitation_record.role,
      'permissions', invitation_record.permissions,
      'parent_account_id', account_owner_id
    );
end;
$$;

-- 2) Allow child users to view their account's business settings
create policy if not exists "Child users can view parent business settings"
  on public.business_settings
  for select
  using (public.get_account_owner(auth.uid()) = user_id);

-- 3) Same-account SELECT policies for key resources
create policy if not exists "Users can view account clients"
  on public.clients
  for select
  using (
    public.get_account_owner(auth.uid()) = public.get_account_owner(user_id)
    and (public.has_permission('view_clients') or public.is_admin())
  );

create policy if not exists "Users can view account inventory"
  on public.enhanced_inventory_items
  for select
  using (
    public.get_account_owner(auth.uid()) = public.get_account_owner(user_id)
    and (public.has_permission('view_inventory') or public.is_admin())
  );

create policy if not exists "Users can view account curtain templates"
  on public.curtain_templates
  for select
  using (
    public.get_account_owner(auth.uid()) = public.get_account_owner(user_id)
    and (public.has_permission('view_window_treatments') or public.has_permission('manage_window_treatments') or public.is_admin())
  );

-- 4) Backfill parent_account_id for existing invited users where possible
update public.user_profiles up
set parent_account_id = ao.account_owner_id
from (
  select inv.invited_email, public.get_account_owner(inviter.id) as account_owner_id
  from public.user_invitations inv
  join auth.users inviter on inviter.email = inv.invited_by_email
  where inv.status in ('accepted','pending')
) s
join auth.users invited on invited.email = s.invited_email
join lateral (select s.account_owner_id) ao on true
where up.user_id = invited.id
  and up.parent_account_id is null;

-- 5) Create direct_messages table for basic messaging
create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null,
  recipient_id uuid not null,
  content text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.direct_messages enable row level security;

-- Messaging RLS
create policy if not exists "Users can insert their own messages"
  on public.direct_messages
  for insert
  with check (auth.uid() = sender_id);

create policy if not exists "Users can view their conversations"
  on public.direct_messages
  for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy if not exists "Recipients can mark messages read"
  on public.direct_messages
  for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- Helpful index for conversations
create index if not exists idx_direct_messages_participants_created_at
  on public.direct_messages (least(sender_id, recipient_id), greatest(sender_id, recipient_id), created_at);
