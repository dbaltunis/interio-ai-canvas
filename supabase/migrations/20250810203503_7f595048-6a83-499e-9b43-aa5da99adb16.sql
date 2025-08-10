-- Retry: policies without IF NOT EXISTS using safe DO blocks

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
DO $$
BEGIN
  CREATE POLICY "Child users can view parent business settings"
    ON public.business_settings
    FOR SELECT
    USING (public.get_account_owner(auth.uid()) = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Same-account SELECT policies for key resources
DO $$
BEGIN
  CREATE POLICY "Users can view account clients"
    ON public.clients
    FOR SELECT
    USING (
      public.get_account_owner(auth.uid()) = public.get_account_owner(user_id)
      AND (public.has_permission('view_clients') OR public.is_admin())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$
BEGIN
  CREATE POLICY "Users can view account inventory"
    ON public.enhanced_inventory_items
    FOR SELECT
    USING (
      public.get_account_owner(auth.uid()) = public.get_account_owner(user_id)
      AND (public.has_permission('view_inventory') OR public.is_admin())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$
BEGIN
  CREATE POLICY "Users can view account curtain templates"
    ON public.curtain_templates
    FOR SELECT
    USING (
      public.get_account_owner(auth.uid()) = public.get_account_owner(user_id)
      AND (public.has_permission('view_window_treatments') OR public.has_permission('manage_window_treatments') OR public.is_admin())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) Backfill parent_account_id for existing invited users where possible
update public.user_profiles up
set parent_account_id = s.account_owner_id
from (
  select invited.id as invited_id, public.get_account_owner(inviter.id) as account_owner_id
  from public.user_invitations inv
  join auth.users inviter on inviter.email = inv.invited_by_email
  join auth.users invited on invited.email = inv.invited_email
  where inv.status in ('accepted','pending')
) s
where up.user_id = s.invited_id
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
DO $$ BEGIN
  CREATE POLICY "Users can insert their own messages"
    ON public.direct_messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their conversations"
    ON public.direct_messages
    FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Recipients can mark messages read"
    ON public.direct_messages
    FOR UPDATE
    USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

create index if not exists idx_direct_messages_participants_created_at
  on public.direct_messages (least(sender_id, recipient_id), greatest(sender_id, recipient_id), created_at);
