create extension if not exists "pgcrypto";

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 30),
  message text not null check (char_length(message) between 1 and 500),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_guestbook_entries_created_at
  on public.guestbook_entries (created_at desc);

alter table public.guestbook_entries enable row level security;

drop policy if exists "public can read guestbook entries" on public.guestbook_entries;
create policy "public can read guestbook entries"
  on public.guestbook_entries
  for select
  to anon
  using (true);
