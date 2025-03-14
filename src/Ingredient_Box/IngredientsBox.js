import React from 'react';
import './IngredientsBox.css';
import InputBox from './InputBox';

// Ingredients box that takes input to add ingredients
const IngredientsBox = () => {
  return (
    // Wrapping green box
    <div className="green-box" data-testid="green-box">
      {/* Input box */}
      <InputBox/>
    </div>
  );
};

export default IngredientsBox;