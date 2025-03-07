import React from 'react';
import './RecipeBox.css';

const RecipeBox = () => {
  return (
    <div className="recipe-box" >
        <img
          src={'/Media/Filter.png'}
          alt="Filter"
          className='filter'
        />

        <div className='scrollbox'>
        <div class="box"></div>
        <div class="box"></div>
        </div>
    </div>
  );
};

export default RecipeBox;