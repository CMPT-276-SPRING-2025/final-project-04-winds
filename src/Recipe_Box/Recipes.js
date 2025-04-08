import React from 'react';
import './Recipes.css'
import IndiviualBox from './IndvRecipe';

// Recipes component props:
// - recipes: An array containing recipe data objects.
// - onRecipeClick: Function to handle what happens when a recipe card is clicked.
const Recipes = ({ recipes, onRecipeClick }) => {
  return (
    // Container with a scrollable, multi-column brick layout
    <div className='scrollbox' data-testid='scrollbox'>

      {recipes && recipes.length > 0 ? (
        recipes.map((recipe, index) => ( // Map each recipe to the IndiviualBox component
          <IndiviualBox
          key={recipe.id || index}
          recipe={recipe}
          onClick={() => onRecipeClick(recipe)} // Pass the recipe object to the click handler
          />
        ))
      ) : (
        <p className='no-recipes'>No recipes found. Enter some ingredients then try searching!</p> // Message shown when no recipes are found
      )}
      </div>
  );
};

export default Recipes;