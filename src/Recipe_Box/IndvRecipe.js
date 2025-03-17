import React from 'react';
import './Recipes.css';

const IndiviualBox = ({ recipe, onClick }) => {
  return (    
    <div className="box" data-testid="box" onClick={onClick}>
      <div className="title" data-testid="title">{recipe.title}</div>
      <img
        src={recipe.image}
        alt={recipe.title}
        className="recipe-image"
        data-testid="image"
      />
    </div>
  );
};

export default IndiviualBox;