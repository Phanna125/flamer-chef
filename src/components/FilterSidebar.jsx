import { useState } from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    difficulty: [],
    dietary: []
  });

  const handleCheckboxChange = (category, value) => {
    setFilters(prev => {
      const currentList = prev[category];
      const newList = currentList.includes(value)
        ? currentList.filter(item => item !== value)
        : [...currentList, value];
      
      const newFilters = { ...prev, [category]: newList };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  return (
    <aside className="filter-sidebar glass-panel">
      <div className="filter-section">
        <h4 className="text-primary">Difficulty</h4>
        <label className="filter-label">
          <input 
            type="checkbox" 
            checked={filters.difficulty.includes('easy')}
            onChange={() => handleCheckboxChange('difficulty', 'easy')}
          />
          <span className="checkbox-custom"></span>
          Easy
        </label>
        <label className="filter-label">
          <input 
            type="checkbox" 
            checked={filters.difficulty.includes('medium')}
            onChange={() => handleCheckboxChange('difficulty', 'medium')}
          />
          <span className="checkbox-custom"></span>
          Medium
        </label>
        <label className="filter-label">
          <input 
            type="checkbox" 
            checked={filters.difficulty.includes('hard')}
            onChange={() => handleCheckboxChange('difficulty', 'hard')}
          />
          <span className="checkbox-custom"></span>
          Hard
        </label>
      </div>

      <div className="filter-section">
        <h4 className="text-primary">Dietary</h4>
        <label className="filter-label">
          <input 
            type="checkbox" 
            checked={filters.dietary.includes('dairy-free')}
            onChange={() => handleCheckboxChange('dietary', 'dairy-free')}
          />
          <span className="checkbox-custom"></span>
          Dairy-Free
        </label>
        <label className="filter-label">
          <input 
            type="checkbox" 
            checked={filters.dietary.includes('pescatarian')}
            onChange={() => handleCheckboxChange('dietary', 'pescatarian')}
          />
          <span className="checkbox-custom"></span>
          Pescatarian
        </label>
      </div>
    </aside>
  );
};

export default FilterSidebar;
