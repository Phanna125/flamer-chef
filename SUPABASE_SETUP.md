# Supabase Setup

This project now supports Supabase as the primary online backend, with the local `src/data/recipes.js` file kept as a fallback while you connect your project.

## What is already wired

- React app fetches recipes from Supabase when env vars are present.
- If Supabase is not configured yet, the app still uses the local recipe dataset.
- Schema starter file: `supabase/migrations/20260315_create_recipe_tables.sql`
- Seed generator: `npm run supabase:seed:generate`
- Env template: `.env.example`

## 1. Create a Supabase project

Create a new project in Supabase and wait for it to finish provisioning.

## 2. Create the recipe tables

Open the Supabase SQL editor and run:

- `supabase/migrations/20260315_create_recipe_tables.sql`

That creates:

- `recipes`
- `recipe_ingredients`
- `recipe_steps`

It also enables read-only public policies so the frontend can fetch recipes.

## 2b. Add admin access and image uploads

Run this migration after the base recipe tables:

- `supabase/migrations/20260315_admin_dashboard.sql`
- `supabase/migrations/20260315_owner_admin_bootstrap.sql`

That adds:

- `admin_users` table
- `public.is_admin()` helper function
- write policies for recipes, ingredients, and steps
- `recipe-images` storage bucket and storage policies
- automatic admin promotion for `tat38254@gmail.com`

## 3. Generate the seed file from the current local recipes

Run:

```bash
npm run supabase:seed:generate
```

That writes:

- `supabase/seed/recipes_seed.sql`

Open that generated SQL file and run it in the Supabase SQL editor.

## 4. Add your frontend env vars

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

You can copy the values from:

- Supabase project settings
- API section

## 5. Restart the frontend

After adding `.env.local`, restart Vite:

```bash
npm run dev
```

## How the app behaves now

- With valid Supabase env vars and seeded tables: recipes load from Supabase.
- Without Supabase config or if the remote fetch fails: recipes fall back to `src/data/recipes.js`.

## Recommended next backend steps

1. Create your owner account in the new `/admin` page.
2. Promote that account into `admin_users` using the SQL shown on the page.
3. Add favorites and saved cooking progress tables.
4. Build a public user account area later if you want saved history.
