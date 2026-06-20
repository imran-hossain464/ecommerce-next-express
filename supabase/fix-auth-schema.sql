create extension if not exists "uuid-ossp";

-- Run this if you created the database before the app switched away from Supabase Auth.
-- It converts profiles into an application-owned user table for Express login/register.

alter table profiles
  drop constraint if exists profiles_id_fkey;

alter table profiles
  alter column id set default uuid_generate_v4();

alter table profiles
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists password_hash text,
  add column if not exists role text not null default 'customer',
  add column if not exists created_at timestamptz not null default now();

update profiles
set full_name = coalesce(full_name, 'Existing Customer')
where full_name is null;

update profiles
set email = concat('legacy+', id::text, '@example.invalid')
where email is null;

update profiles
set password_hash = 'legacy-account-disabled'
where password_hash is null;

update profiles
set role = 'customer'
where role not in ('customer', 'admin');

alter table profiles
  alter column full_name set not null,
  alter column email set not null,
  alter column password_hash set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'profiles'::regclass
  ) then
    alter table profiles
      add constraint profiles_role_check check (role in ('customer', 'admin'));
  end if;
end $$;

create unique index if not exists profiles_email_key on profiles(email);
