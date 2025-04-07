import React from 'react';
import './RecipeBox.css';
import Filter from './Filter';
import Recipes from './Recipes';
import RecipeModal from './RecipeModal';

// main container for displaying recipes and filters 
// recipes - List of recipe objects we want to show
// onRecipeClick - What to do when someone clicks a recipe
// selectedRecipe - Which recipe is currently selected (or null if none)
// closeModal - How to close the detailed recipe popup
// isToggled - Whether the filter panel is open or closed
// filterToggle - Function to open/close the filter panel
// filterOptionToggle - Function to add/remove specific filters
// selectedFilters - List of currently active dietary filters
// excludedIngredients - Ingredients we want to exclude from recipes
// setExcludedIngredients - How to update the excluded ingredients list
const RecipeBox = ({ recipes, onRecipeClick, selectedRecipe, closeModal, isToggled, filterToggle, filterOptionToggle, selectedFilters, excludedIngredients, setExcludedIngredients}) => {
  return (
    <div className="recipe-box" data-testid="recipe-box">
      {/* filter component for diet filters and ingredient exclusion */}
      <Filter isToggled={isToggled} filterToggle={filterToggle} filterOptionToggle={filterOptionToggle} selectedFilters={selectedFilters} 
      excludedIngredients={excludedIngredients} setExcludedIngredients={setExcludedIngredients}/>
      
      <div className="scrollbox-wrapper">
        <Recipes recipes={recipes} onRecipeClick={onRecipeClick} />
      </div>
      {selectedRecipe && (
        <div className="modal-container">
          <RecipeModal recipe={selectedRecipe} onClose={closeModal} />
        </div>
      )}
      
    </div>
  );
};

export default RecipeBox;
