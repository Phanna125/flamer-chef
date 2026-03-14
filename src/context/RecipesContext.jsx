import { useCallback, useEffect, useMemo, useState } from 'react';
import { recipes as localRecipes } from '../data/recipes';
import { fetchRecipesFromSupabase } from '../lib/recipesApi';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { RecipesContext } from './recipes-context';

export function RecipesProvider({ children }) {
  const [recipes, setRecipes] = useState(localRecipes);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(isSupabaseConfigured ? 'checking' : 'local');

  const refreshRecipes = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setRecipes(localRecipes);
      setLoading(false);
      setSource('local');
      setError(null);
      return localRecipes;
    }

    setLoading(true);

    try {
      const remoteRecipes = await fetchRecipesFromSupabase();

      if (remoteRecipes.length > 0) {
        setRecipes(remoteRecipes);
        setSource('supabase');
        setError(null);
        return remoteRecipes;
      }

      setRecipes(localRecipes);
      setSource('local');
      setError(null);
      return localRecipes;
    } catch (loadError) {
      setRecipes(localRecipes);
      setSource('local');
      setError(loadError instanceof Error ? loadError : new Error('Failed to load recipes'));
      return localRecipes;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRecipes() {
      const nextRecipes = await refreshRecipes();

      if (cancelled) {
        return;
      }

      setRecipes(nextRecipes);
    }

    loadRecipes();

    return () => {
      cancelled = true;
    };
  }, [refreshRecipes]);

  const value = useMemo(() => ({
    recipes,
    loading,
    error,
    source,
    isRemote: source === 'supabase',
    refreshRecipes,
  }), [recipes, loading, error, source, refreshRecipes]);

  return (
    <RecipesContext.Provider value={value}>
      {children}
    </RecipesContext.Provider>
  );
}
