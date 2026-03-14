import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Hash, Star, Clock, ChefHat, Heart } from 'lucide-react';
import { useRecipes } from '../hooks/useRecipes';
import './HomePage.css';

const SUGGESTED_INGREDIENTS = ['សាច់ជ្រូក', 'សាច់មាន់', 'ទឹកដោះគោ', 'ស៊ុត', 'បន្លែផ្សេងៗ', 'ត្រី'];

export default function HomePage() {
  const [inputValue, setInputValue] = useState('');
  const { recipes } = useRecipes();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      navigate(`/search?q=${inputValue.trim()}`);
    }
  };

  const addSuggested = (ing) => {
    setInputValue(prev => prev ? `${prev}, ${ing}` : ing);
  };

  // Get 4 recipes for featured section
  const featuredRecipes = recipes.slice(0, 4);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content text-center">
          <h1 className="hero-title">តើក្នុងទូរទឹកកកអ្នកមានអ្វីខ្លះ?</h1>
          <p className="hero-subtitle">ស្វែងរកមុខម្ហូបថ្មីៗជារៀងរាល់ថ្ងៃជាមួយគ្រឿងផ្សំដែលអ្នកមានស្រាប់។</p>

          <form onSubmit={handleSearch} className="search-bar-pill">
            <Hash className="search-icon-left" size={20} />
            <input 
              type="text" 
              placeholder="ត្រី, គ្រឿងផ្សំ, បន្លែ..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="search-btn-yellow">
              <Search size={16} /> ស្វែងរក
            </button>
          </form>

          <div className="suggested-tags-wrapper">
            <span>បញ្ចូលជាមួយ: </span>
            {SUGGESTED_INGREDIENTS.map(ing => (
              <button 
                key={ing} 
                className="suggested-tag-dark"
                onClick={() => addSuggested(ing)}
              >
                {ing}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container promo-banners">
        <div className="promo-card promo-bg-ingredients">
          <div className="promo-overlay"></div>
          <div className="promo-content">
            <h2>ស្វែងរកតាមគ្រឿងផ្សំ</h2>
            <p>ចង្អុលបង្ហាញគ្រឿងផ្សំក្នុងផ្ទះបាយហើយជួយបង្កើតមុខម្ហូប។</p>
          </div>
        </div>
        
        <div className="promo-card promo-bg-dish">
          <div className="promo-overlay"></div>
          <div className="promo-content">
            <span className="promo-tag">មុខម្ហូបថ្មីៗ</span>
            <h2>មុខម្ហូបប្រចាំថ្ងៃ</h2>
            <p>ស្វែងរកមុខម្ហូបថ្មីៗដ៏សម្បូរបែបដែលចូលរួមជាមួយមេចុងភៅដ៏ចំណាន។</p>
            <button className="promo-action-btn">
              <ChefHat size={20} />
            </button>
          </div>
        </div>
      </section>

      <section className="container categories-section">
        <h2 className="section-title text-center">ជ្រើសរើសតាមប្រភេទ</h2>
        <div className="categories-grid">
          <div className="category-item">
            <div className="category-icon bg-orange-light">🍳</div>
            <span className="category-name">អាហារពេលព្រឹក</span>
          </div>
          <div className="category-item">
            <div className="category-icon bg-blue-light">🍲</div>
            <span className="category-name">ស៊ុប</span>
          </div>
          <div className="category-item">
            <div className="category-icon bg-yellow-light">🍚</div>
            <span className="category-name">បាយ</span>
          </div>
          <div className="category-item">
            <div className="category-icon bg-green-light">🥗</div>
            <span className="category-name">សុខភាព</span>
          </div>
          <div className="category-item">
            <div className="category-icon bg-red-light">🍡</div>
            <span className="category-name">អាហារសម្រន់</span>
          </div>
        </div>
      </section>

      <section className="container featured-section">
        <div className="section-header-flex">
          <div>
            <h2 className="section-title">មុខម្ហូបពិសេសប្រចាំថ្ងៃ</h2>
            <p className="section-subtitle">មុខម្ហូបពេញនិយមនិងមានរស់ជាតិឆ្ងាញ់ប្រចាំថ្ងៃនេះ</p>
          </div>
          <Link to="/search" className="view-all-link">មើលទាំងអស់បន្ត →</Link>
        </div>

        <div className="recipes-grid">
          {featuredRecipes.map(recipe => (
            <div key={recipe.id} className="recipe-card-modern">
               <div className="recipe-card-image" style={{ backgroundImage: `url("${encodeURI(recipe.image)}")` }}>
                  <button className="heart-btn"><Heart size={16} /></button>
                  <div className="card-tags">
                     <span className="tag-yellow">ថ្មីៗ</span>
                     <span className="tag-dark">{recipe.category}</span>
                  </div>
               </div>
               <div className="recipe-card-content">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className="star-icon text-primary" fill={i < Math.floor(recipe.rating) ? "currentColor" : "none"} />)}
                    <span className="rating-text">{recipe.rating}</span>
                  </div>
                  <h3 className="recipe-title">{recipe.name.km} ({recipe.name.en})</h3>
                  
                  <div className="recipe-footer-meta">
                     <span className="meta-text"><Clock size={16} /> {recipe.cookTime} នាទី</span>
                     <span className="meta-text"><ChefHat size={16} /> {recipe.difficulty === 'easy' ? 'ងាយស្រួល' : recipe.difficulty === 'medium' ? 'មធ្យម' : 'ពិបាក'}</span>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
