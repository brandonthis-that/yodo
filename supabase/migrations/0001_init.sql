-- Yodo schema. Run this in the Supabase SQL editor, or:
--   npx supabase db push
--
-- days_of_week uses JS-style weekdays: 0 = Sunday … 6 = Saturday.

create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  due_time time not null,
  days_of_week int[] not null default '{1,2,3,4,5}',
  bonus_points int not null default 5,
  color text not null default '#0381FE',
  sort_order int not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  group_id uuid references public.groups (id) on delete cascade,
  title text not null,
  points int not null default 1,
  reminder_minutes_before int,
  due_time time,
  days_of_week int[] not null default '{0,1,2,3,4,5,6}',
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint tasks_standalone_or_grouped check (
    (group_id is not null) or (due_time is not null)
  )
);

create table public.completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid not null references public.tasks (id) on delete cascade,
  completed_on date not null,
  completed_at timestamptz not null default now(),
  unique (task_id, completed_on)
);

create table public.group_bonuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  group_id uuid not null references public.groups (id) on delete cascade,
  earned_on date not null,
  points int not null,
  unique (group_id, earned_on)
);

create index groups_user_id_idx on public.groups (user_id);
create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_group_id_idx on public.tasks (group_id);
create index completions_user_on_idx on public.completions (user_id, completed_on);
create index group_bonuses_user_on_idx on public.group_bonuses (user_id, earned_on);

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.tasks enable row level security;
alter table public.completions enable row level security;
alter table public.group_bonuses enable row level security;

create policy "profiles are own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "groups are own" on public.groups
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tasks are own" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "completions are own" on public.completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "group_bonuses are own" on public.group_bonuses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, timezone)
  values (new.id, coalesce(new.raw_user_meta_data->>'timezone', 'UTC'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter publication supabase_realtime add table public.groups;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.completions;
alter publication supabase_realtime add table public.group_bonuses;
