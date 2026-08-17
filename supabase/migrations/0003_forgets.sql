-- Forgotten occurrences. Same grain as completions: one row per task per day.
-- Marking forgotten is opt-in; midnight does not write these.
-- Idempotent so a fresh database that already ran 0001_init.sql can still apply this file.

create table if not exists public.forgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid not null references public.tasks (id) on delete cascade,
  forgotten_on date not null,
  forgotten_at timestamptz not null default now(),
  unique (task_id, forgotten_on)
);

create index if not exists forgets_user_on_idx on public.forgets (user_id, forgotten_on);

alter table public.forgets enable row level security;

drop policy if exists "forgets are own" on public.forgets;
create policy "forgets are own" on public.forgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

do $$
begin
  alter publication supabase_realtime add table public.forgets;
exception
  when duplicate_object then null;
end
$$;
