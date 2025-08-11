-- Create mentions table for project notes
create table if not exists public.project_note_mentions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.project_notes(id) on delete cascade,
  mentioned_user_id uuid not null,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

-- Optional FKs for better joins (user_profiles is safe to reference)
alter table public.project_note_mentions
  add constraint project_note_mentions_mentioned_user_fk
  foreign key (mentioned_user_id) references public.user_profiles(user_id) on delete cascade;

-- Indexes
create index if not exists idx_note_mentions_note_id on public.project_note_mentions(note_id);
create index if not exists idx_note_mentions_user_id on public.project_note_mentions(mentioned_user_id);
create index if not exists idx_note_mentions_created_by on public.project_note_mentions(created_by);

-- Enable RLS
alter table public.project_note_mentions enable row level security;

-- Policies
create policy "Authors can insert mentions for their notes"
  on public.project_note_mentions for insert
  with check (auth.uid() = created_by);

create policy "Mentioned user, author, or account owner can view mentions"
  on public.project_note_mentions for select
  using (
    auth.uid() = mentioned_user_id
    or auth.uid() = created_by
    or public.get_account_owner(created_by) = public.get_account_owner(auth.uid())
  );

create policy "Authors or admins can update mentions"
  on public.project_note_mentions for update
  using (auth.uid() = created_by or public.is_admin());

create policy "Authors or admins can delete mentions"
  on public.project_note_mentions for delete
  using (auth.uid() = created_by or public.is_admin());

-- Trigger for updated_at is not needed; immutable rows. If needed later, add.
