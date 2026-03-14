create table if not exists public.recipes (
  id text primary key,
  name_en text not null,
  name_km text,
  image text not null,
  category text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  prep_time integer not null default 0 check (prep_time >= 0),
  cook_time integer not null default 0 check (cook_time >= 0),
  servings integer not null default 1 check (servings > 0),
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  dietary text[] not null default ARRAY[]::text[],
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.recipe_ingredients (
  id bigint generated always as identity primary key,
  recipe_id text not null references public.recipes(id) on delete cascade,
  name text not null,
  amount text,
  essential boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.recipe_steps (
  id bigint generated always as identity primary key,
  recipe_id text not null references public.recipes(id) on delete cascade,
  instruction text not null,
  timer integer,
  tip text,
  sort_order integer not null default 0
);

create index if not exists recipe_ingredients_recipe_id_idx
  on public.recipe_ingredients(recipe_id, sort_order);

create index if not exists recipe_steps_recipe_id_idx
  on public.recipe_steps(recipe_id, sort_order);

alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;

drop policy if exists "Public can read recipes" on public.recipes;
create policy "Public can read recipes"
  on public.recipes
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read recipe ingredients" on public.recipe_ingredients;
create policy "Public can read recipe ingredients"
  on public.recipe_ingredients
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read recipe steps" on public.recipe_steps;
create policy "Public can read recipe steps"
  on public.recipe_steps
  for select
  to anon, authenticated
  using (true);
