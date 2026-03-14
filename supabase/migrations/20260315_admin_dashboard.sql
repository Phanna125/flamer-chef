create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "Admins can view own membership" on public.admin_users;
create policy "Admins can view own membership"
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Admins can insert recipes" on public.recipes;
create policy "Admins can insert recipes"
  on public.recipes
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update recipes" on public.recipes;
create policy "Admins can update recipes"
  on public.recipes
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete recipes" on public.recipes;
create policy "Admins can delete recipes"
  on public.recipes
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert recipe ingredients" on public.recipe_ingredients;
create policy "Admins can insert recipe ingredients"
  on public.recipe_ingredients
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update recipe ingredients" on public.recipe_ingredients;
create policy "Admins can update recipe ingredients"
  on public.recipe_ingredients
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete recipe ingredients" on public.recipe_ingredients;
create policy "Admins can delete recipe ingredients"
  on public.recipe_ingredients
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert recipe steps" on public.recipe_steps;
create policy "Admins can insert recipe steps"
  on public.recipe_steps
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update recipe steps" on public.recipe_steps;
create policy "Admins can update recipe steps"
  on public.recipe_steps
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete recipe steps" on public.recipe_steps;
create policy "Admins can delete recipe steps"
  on public.recipe_steps
  for delete
  to authenticated
  using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recipe-images',
  'recipe-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read recipe images" on storage.objects;
create policy "Public can read recipe images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'recipe-images');

drop policy if exists "Admins can upload recipe images" on storage.objects;
create policy "Admins can upload recipe images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'recipe-images'
    and public.is_admin()
  );

drop policy if exists "Admins can update recipe images" on storage.objects;
create policy "Admins can update recipe images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'recipe-images'
    and public.is_admin()
  )
  with check (
    bucket_id = 'recipe-images'
    and public.is_admin()
  );

drop policy if exists "Admins can delete recipe images" on storage.objects;
create policy "Admins can delete recipe images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'recipe-images'
    and public.is_admin()
  );
