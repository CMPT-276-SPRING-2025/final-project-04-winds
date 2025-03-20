import React from 'react';
import './IngredientsBox.css';
import InputBox from './InputBox';

// Ingredients box that takes input to add ingredients
const IngredientsBox = ({ ingredients, setIngredients, onSearch }) => {
  return (
    // Wrapping green box
    <div className="green-box" data-testid="green-box">
      <div className="input-container">
          {/* Input box */}
          <InputBox ingredients={ingredients} setIngredients={setIngredients} />
      </div>
      {/* Button to search for recipes */}
      <button className="search-button" onClick={onSearch}>
        Get Cooking!
      </button>
    </div>
  );
};

export default IngredientsBox;