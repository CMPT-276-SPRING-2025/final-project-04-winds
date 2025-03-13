import React from 'react';
import './Recipes.css'
import IndiviualBox from './IndvRecipe';

const Recipes = () => {
  return (
    <div className='scrollbox' data-testid='scrollbox'>
        {/* Indiviual recipes */}
        <IndiviualBox/>
        <IndiviualBox/>
      </div>
  );
};

export default Recipes;