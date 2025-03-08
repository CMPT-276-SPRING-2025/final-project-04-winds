import React from 'react';
import './RecipeBox.css';
import Filter from './Filter';

// The Box that takes the ingredients 
const RecipeBox = () => {
  return (

    // wrapping object
    <div className="recipe-box" >
      {/* The filter icon */}
      <Filter/>

      {/* The box that holds all the recipes*/}
      <div className='scrollbox'>
        {/* Indiviual recipes */}
        <div class="box"><div class="title"></div></div>
        <div class="box"><div class="title"></div></div>
      </div>
    </div>
  );
};

export default RecipeBox;