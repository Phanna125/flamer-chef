import { useContext } from 'react';
import { RecipesContext } from '../context/recipes-context';

export function useRecipes() {
  const context = useContext(RecipesContext);

  if (!context) {
    throw new Error('useRecipes must be used inside RecipesProvider');
  }

  return context;
}
