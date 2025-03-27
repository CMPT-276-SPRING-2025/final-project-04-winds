import React from 'react';
import './RecipeBox.css';
import Filter from './Filter';
import Recipes from './Recipes';
import RecipeModal from './RecipeModal';

const RecipeBox = ({ recipes, onRecipeClick, selectedRecipe, closeModal, isToggled, filterToggle, filterOptionToggle, selectedFilters, excludedIngredients, setExcludedIngredients}) => {
  return (
    <div className="recipe-box" data-testid="recipe-box">

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
