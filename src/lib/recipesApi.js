import { supabase, isSupabaseConfigured } from './supabaseClient';

const RECIPE_SELECT = `
  id,
  name_en,
  name_km,
  image,
  category,
  difficulty,
  prep_time,
  cook_time,
  servings,
  rating,
  dietary,
  created_at,
  recipe_ingredients (
    id,
    name,
    amount,
    essential,
    sort_order
  ),
  recipe_steps (
    id,
    instruction,
    timer,
    tip,
    sort_order
  )
`;

function sortByOrder(items) {
  return [...items].sort((left, right) => {
    const leftOrder = left.sort_order ?? 0;
    const rightOrder = right.sort_order ?? 0;
    return leftOrder - rightOrder;
  });
}

function mapRecipeRow(row) {
  return {
    id: row.id,
    name: {
      en: row.name_en || '',
      km: row.name_km || '',
    },
    image: row.image || '',
    category: row.category || '',
    difficulty: row.difficulty || 'easy',
    prepTime: row.prep_time ?? 0,
    cookTime: row.cook_time ?? 0,
    servings: row.servings ?? 1,
    rating: Number(row.rating ?? 0),
    dietary: Array.isArray(row.dietary) ? row.dietary : [],
    ingredients: sortByOrder(row.recipe_ingredients || []).map((ingredient) => ({
      name: ingredient.name,
      amount: ingredient.amount,
      essential: Boolean(ingredient.essential),
    })),
    steps: sortByOrder(row.recipe_steps || []).map((step) => ({
      instruction: step.instruction,
      timer: step.timer,
      tip: step.tip,
    })),
  };
}

export async function fetchRecipesFromSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('recipes')
    .select(RECIPE_SELECT)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map(mapRecipeRow);
}
