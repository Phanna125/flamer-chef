import { supabase, isSupabaseConfigured } from './supabaseClient';
import { fetchRecipesFromSupabase } from './recipesApi';

const IMAGE_BUCKET = 'recipe-images';

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  return supabase;
}

function slugifyRecipeId(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function parseInteger(value, fallback = 0) {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function parseRating(value) {
  const parsedValue = Number.parseFloat(value);
  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.min(5, Math.max(0, Number(parsedValue.toFixed(1))));
}

function normalizeArray(values) {
  return values.filter(Boolean).map((value) => value.trim()).filter(Boolean);
}

function mapRecipeFormToPayload(recipeForm) {
  const recipeId = recipeForm.id?.trim() || slugifyRecipeId(recipeForm.nameEn);

  if (!recipeId) {
    throw new Error('Recipe ID is required. Add an English name or custom ID.');
  }

  if (!recipeForm.nameEn?.trim()) {
    throw new Error('English recipe name is required.');
  }

  if (!recipeForm.image?.trim()) {
    throw new Error('Recipe image is required.');
  }

  const ingredients = recipeForm.ingredients
    .map((ingredient, index) => ({
      recipe_id: recipeId,
      name: (ingredient.name || '').trim(),
      amount: (ingredient.amount || '').trim(),
      essential: Boolean(ingredient.essential),
      sort_order: index,
    }))
    .filter((ingredient) => ingredient.name);

  const steps = recipeForm.steps
    .map((step, index) => ({
      recipe_id: recipeId,
      instruction: (step.instruction || '').trim(),
      timer: step.timer ? parseInteger(step.timer, null) : null,
      tip: (step.tip || '').trim() || null,
      sort_order: index,
    }))
    .filter((step) => step.instruction);

  if (ingredients.length === 0) {
    throw new Error('Add at least one ingredient.');
  }

  if (steps.length === 0) {
    throw new Error('Add at least one cooking step.');
  }

  return {
    recipeId,
    recipe: {
      id: recipeId,
      name_en: recipeForm.nameEn.trim(),
      name_km: recipeForm.nameKm.trim() || null,
      image: recipeForm.image.trim(),
      category: recipeForm.category.trim() || 'General',
      difficulty: recipeForm.difficulty,
      prep_time: parseInteger(recipeForm.prepTime, 0),
      cook_time: parseInteger(recipeForm.cookTime, 0),
      servings: Math.max(1, parseInteger(recipeForm.servings, 1)),
      rating: parseRating(recipeForm.rating),
      dietary: normalizeArray(
        recipeForm.dietary
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    },
    ingredients,
    steps,
  };
}

function createFriendlyError(error, fallbackMessage) {
  if (error instanceof Error && error.message) {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return new Error(error.message);
  }

  return new Error(fallbackMessage);
}

export function recipeToFormValues(recipe) {
  return {
    id: recipe.id,
    nameEn: recipe.name.en,
    nameKm: recipe.name.km || '',
    image: recipe.image,
    category: recipe.category,
    difficulty: recipe.difficulty,
    prepTime: String(recipe.prepTime ?? 0),
    cookTime: String(recipe.cookTime ?? 0),
    servings: String(recipe.servings ?? 1),
    rating: String(recipe.rating ?? 0),
    dietary: Array.isArray(recipe.dietary) ? recipe.dietary.join(', ') : '',
    ingredients: recipe.ingredients.length > 0
      ? recipe.ingredients.map((ingredient) => ({
          name: ingredient.name || '',
          amount: ingredient.amount || '',
          essential: Boolean(ingredient.essential),
        }))
      : [{ name: '', amount: '', essential: true }],
    steps: recipe.steps.length > 0
      ? recipe.steps.map((step) => ({
          instruction: step.instruction || '',
          timer: step.timer ? String(step.timer) : '',
          tip: step.tip || '',
        }))
      : [{ instruction: '', timer: '', tip: '' }],
  };
}

export function createEmptyRecipeForm() {
  return {
    id: '',
    nameEn: '',
    nameKm: '',
    image: '',
    category: '',
    difficulty: 'easy',
    prepTime: '10',
    cookTime: '20',
    servings: '2',
    rating: '4.5',
    dietary: '',
    ingredients: [{ name: '', amount: '', essential: true }],
    steps: [{ instruction: '', timer: '', tip: '' }],
  };
}

export async function fetchAdminMembership(userId) {
  const client = requireSupabase();

  if (!userId) {
    return null;
  }

  const { data, error } = await client
    .from('admin_users')
    .select('user_id, email, role, created_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205') {
      return null;
    }

    throw createFriendlyError(error, 'Failed to check admin membership.');
  }

  return data;
}

export async function saveRecipeToSupabase(recipeForm) {
  const client = requireSupabase();
  const payload = mapRecipeFormToPayload(recipeForm);

  const { error: recipeError } = await client
    .from('recipes')
    .upsert(payload.recipe, { onConflict: 'id' });

  if (recipeError) {
    throw createFriendlyError(recipeError, 'Failed to save recipe.');
  }

  const { error: deleteIngredientsError } = await client
    .from('recipe_ingredients')
    .delete()
    .eq('recipe_id', payload.recipeId);

  if (deleteIngredientsError) {
    throw createFriendlyError(deleteIngredientsError, 'Failed to refresh recipe ingredients.');
  }

  const { error: deleteStepsError } = await client
    .from('recipe_steps')
    .delete()
    .eq('recipe_id', payload.recipeId);

  if (deleteStepsError) {
    throw createFriendlyError(deleteStepsError, 'Failed to refresh recipe steps.');
  }

  const { error: ingredientsError } = await client
    .from('recipe_ingredients')
    .insert(payload.ingredients);

  if (ingredientsError) {
    throw createFriendlyError(ingredientsError, 'Failed to save recipe ingredients.');
  }

  const { error: stepsError } = await client
    .from('recipe_steps')
    .insert(payload.steps);

  if (stepsError) {
    throw createFriendlyError(stepsError, 'Failed to save cooking steps.');
  }

  const recipes = await fetchRecipesFromSupabase();
  return recipes.find((recipe) => recipe.id === payload.recipeId) || null;
}

export async function deleteRecipeFromSupabase(recipeId) {
  const client = requireSupabase();

  const { error } = await client
    .from('recipes')
    .delete()
    .eq('id', recipeId);

  if (error) {
    throw createFriendlyError(error, 'Failed to delete recipe.');
  }
}

export async function uploadRecipeImage(file, recipeId) {
  const client = requireSupabase();

  if (!file) {
    throw new Error('Choose an image file first.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeRecipeId = slugifyRecipeId(recipeId || file.name) || 'recipe-image';
  const filePath = `${safeRecipeId}/${Date.now()}.${extension}`;

  const { error: uploadError } = await client
    .storage
    .from(IMAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      contentType: file.type || undefined,
      upsert: false,
    });

  if (uploadError) {
    throw createFriendlyError(uploadError, 'Failed to upload recipe image.');
  }

  const { data } = client.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);

  return {
    filePath,
    publicUrl: data.publicUrl,
  };
}
