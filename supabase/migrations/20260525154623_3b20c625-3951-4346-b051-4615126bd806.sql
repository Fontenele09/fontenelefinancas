
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  xp integer not null default 0,
  level integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Trigger to auto-create profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Routines
create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  category text,
  time_of_day text,
  days integer[] not null default '{}',
  grace_days integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.routines enable row level security;
create policy "routines_all_own" on public.routines for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index routines_user_idx on public.routines(user_id);

-- Completions
create table public.routine_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_id uuid not null references public.routines(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique(routine_id, date)
);
alter table public.routine_completions enable row level security;
create policy "completions_all_own" on public.routine_completions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index completions_user_date_idx on public.routine_completions(user_id, date);

-- Achievements
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  title text not null,
  description text,
  unlocked_at timestamptz not null default now(),
  unique(user_id, code)
);
alter table public.achievements enable row level security;
create policy "achievements_all_own" on public.achievements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
