-- Tighten Announcements RLS to admin-only writes
-- Apply after running supabase_setup.sql (which creates user_profiles) and announcements_schema.sql

-- Helper function to check if current auth user is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.role = 'admin'
  );
$$;

-- Ensure basic read policy exists
drop policy if exists "announcements_select_auth" on public.announcements;
create policy "announcements_select_auth" on public.announcements
  for select to authenticated using (true);

-- Replace permissive insert/update/delete policies with admin-only
drop policy if exists "Authenticated users can create announcements" on public.announcements;
drop policy if exists "Authors can update their own announcements" on public.announcements;
drop policy if exists "Authors can delete their own announcements" on public.announcements;

create policy "announcements_insert_admin_only" on public.announcements
  for insert to authenticated
  with check (public.is_admin());

create policy "announcements_update_admin_only" on public.announcements
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "announcements_delete_admin_only" on public.announcements
  for delete to authenticated
  using (public.is_admin());

-- Example: promote a user to admin (replace placeholders)
-- insert into public.user_profiles (auth_user_id, email, full_name, role)
-- values ('00000000-0000-0000-0000-000000000000', 'admin@yourcity.gov', 'City Admin', 'admin')
-- on conflict (auth_user_id) do update set role='admin';

