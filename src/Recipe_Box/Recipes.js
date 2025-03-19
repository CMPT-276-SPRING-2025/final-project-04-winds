import React from 'react';
import './Recipes.css'
import IndiviualBox from './IndvRecipe';

const Recipes = ({ recipes, onRecipeClick }) => {
  return (
    <div className='scrollbox' data-testid='scrollbox'>

      {recipes && recipes.length > 0 ? (
        recipes.map((recipe, index) => (
          <IndiviualBox
          key={recipe.id || index}
          recipe={recipe}
          onClick={() => onRecipeClick(recipe)}
          />
        ))
      ) : (
        <p className='no-recipes'>No recipes found. Enter some ingrendients then try searching!</p>
      )}
      </div>
  );
};

export default Recipes;