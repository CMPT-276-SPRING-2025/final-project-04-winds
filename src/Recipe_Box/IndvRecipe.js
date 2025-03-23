import React from 'react';
import './Recipes.css';

const IndiviualBox = ({ recipe, onClick }) => {
  return (  
    <button
    type="button"
    className='box'
    data-testid='box'
    onClick={onClick}
    >
      <div className="recipe-title" data-testid="title">{recipe.title}</div>
      <img
        src={recipe.image || "/Media/Logo.gif"}
        onError={(e) => {
          e.target.onError = null;
          e.target.src = "/Media/Logo.gif";
        }}
        alt={recipe.title}
        className="recipe-image"
        data-testid="image"
      />
    </button>
  );
};

export default IndiviualBox;