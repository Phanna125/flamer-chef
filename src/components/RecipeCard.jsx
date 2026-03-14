import { Link } from 'react-router-dom';
import { Clock, Users, ChefHat } from 'lucide-react';
import './RecipeCard.css';

const RecipeCard = ({ recipe, matchPercentage }) => {
  const imageUrl = `url("${encodeURI(recipe.image)}")`;

  return (
    <Link to={`/recipe/${recipe.id}`} className="recipe-card glass-panel">
      <div className="card-image-wrap">
        <div className="card-image" style={{ backgroundImage: imageUrl }} />
        <div className="badge-match">
          {matchPercentage}% Match
        </div>
        <div className={`badge-difficulty difficulty-${recipe.difficulty}`}>
          {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
        </div>
      </div>
      
      <div className="card-content">
        <div className="recipe-title-group">
          <h3 className="recipe-title-en">{recipe.name.en}</h3>
          <span className="recipe-title-km">{recipe.name.km}</span>
        </div>
        
        <div className="recipe-meta">
          <span className="meta-item text-primary" title="Rating">
            ⭐ {recipe.rating}
          </span>
          <span className="meta-item">
            <Clock size={16} /> {recipe.cookTime + recipe.prepTime}m
          </span>
          <span className="meta-item">
            <Users size={16} /> {recipe.servings}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
