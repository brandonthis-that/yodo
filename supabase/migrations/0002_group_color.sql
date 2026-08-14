-- Add a per-routine color used as the Today card background.

alter table public.groups
  add column if not exists color text not null default '#0381FE';
