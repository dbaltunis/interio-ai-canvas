-- Create table for project/job notes with account-scoped visibility
create table if not exists public.project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  quote_id uuid,
  user_id uuid not null,
  content text not null,
  type text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.project_notes enable row level security;

-- Helpful indexes
create index if not exists idx_project_notes_project_id on public.project_notes(project_id);
create index if not exists idx_project_notes_quote_id on public.project_notes(quote_id);
create index if not exists idx_project_notes_user_id on public.project_notes(user_id);
create index if not exists idx_project_notes_created_at on public.project_notes(created_at desc);

-- Policies
-- Anyone in the same account can read notes
create policy if not exists "Account users can read project notes"
  on public.project_notes for select
  using (
    public.get_account_owner(user_id) = public.get_account_owner(auth.uid())
  );

-- Authors can insert their own notes
create policy if not exists "Users can create their own project notes"
  on public.project_notes for insert
  with check (auth.uid() = user_id);

-- Authors or admins can update their notes
create policy if not exists "Authors or admins can update notes"
  on public.project_notes for update
  using (auth.uid() = user_id or public.is_admin());

-- Authors or admins can delete notes
create policy if not exists "Authors or admins can delete notes"
  on public.project_notes for delete
  using (auth.uid() = user_id or public.is_admin());

-- Trigger to keep updated_at fresh
create trigger if not exists trg_project_notes_updated
before update on public.project_notes
for each row execute function public.update_updated_at_column();