import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import FilterSidebar from '../components/FilterSidebar';
import { useRecipes } from '../hooks/useRecipes';
import { getDisplaySearchTerms, rankRecipesByQuery } from '../lib/searchRanking';
import './SearchResults.css';

export default function SearchResults() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.get('q') || '';
  const { recipes } = useRecipes();
  const searchIngredients = useMemo(() => getDisplaySearchTerms(q), [q]);

  const [activeFilters, setActiveFilters] = useState({
    difficulty: [],
    dietary: []
  });

  const matchedRecipes = useMemo(() => {
    return rankRecipesByQuery(recipes, q).filter((recipe) => {
      // Apply filters
      if (activeFilters.difficulty.length > 0 && !activeFilters.difficulty.includes(recipe.difficulty)) {
        return false;
      }
      
      if (activeFilters.dietary.length > 0) {
        const meetsDietary = activeFilters.dietary.every(diet => recipe.dietary.includes(diet));
        if (!meetsDietary) return false;
      }

      return true;
    });
  }, [recipes, q, activeFilters]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  return (
    <div className="search-results-page container">
      
      <div className="search-header">
        <h1 className="search-title">
          {searchIngredients.length > 0
            ? `Found ${matchedRecipes.length} recipes for your ingredients`
            : 'Explore Our Full Collection'
          }
        </h1>
        {searchIngredients.length > 0 && (
          <div className="search-ingredients-display" style={{ marginTop: '12px' }}>
            <span style={{ color: '#A8A29E' }}>Cooking with: </span>
            {searchIngredients.map((ing) => (
              <span key={ing} className="tag" style={{ background: 'rgba(234, 179, 8, 0.15)', color: 'var(--primary-400)', marginLeft: '8px' }}>
                {ing}
              </span>
            ))}
          </div>
        )}
        {searchIngredients.length > 0 && (
          <p style={{ marginTop: '14px', color: '#78716c' }}>
            Best matches are shown first. Other recipes stay below for inspiration.
          </p>
        )}
      </div>

      <div className="search-layout">
        <div className="search-sidebar-wrapper">
          <FilterSidebar onFilterChange={handleFilterChange} />
        </div>
        
        <div className="recipes-grid">
          {matchedRecipes.length > 0 ? (
            matchedRecipes.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                matchPercentage={recipe.matchPercentage} 
              />
            ))
          ) : (
            <div className="no-results glass-panel">
              <h3 className="text-primary">No recipes found</h3>
              <p>Try adjusting your ingredients or filters to find more recipes.</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
