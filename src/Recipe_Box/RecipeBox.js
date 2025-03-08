import React from 'react';
import './RecipeBox.css';
import Filter from './Filter';
import Recipes from './Recipes';

// The Box that takes the ingredients 
const RecipeBox = () => {
  return (

    // wrapping object
    <div className="recipe-box" >
      {/* The filter icon */}
      <Filter/>

      {/* The box that holds all the recipes*/}
      <Recipes/>
    </div>
  );
};

export default RecipeBox;