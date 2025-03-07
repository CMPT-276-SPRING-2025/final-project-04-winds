import React from 'react';
import './RecipeBox.css';

// The Box that takes the ingredients 
const RecipeBox = () => {
  return (

    // wrapping object
    <div className="recipe-box" >
      {/* The filter icon */}
      <img
        src={'/Media/Filter.png'}
        alt="Filter"
        className='filter'
      />

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