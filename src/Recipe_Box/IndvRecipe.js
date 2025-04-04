import React, { useState } from 'react';
import './Recipes.css';

const IndiviualBox = ({ recipe, onClick }) => {
  // Declare the state variable here
  const [imageError, setImageError] = useState(false);

  return (  
    <button
      type="button"
      className="box"
      onClick={onClick}
    >
      <div className="recipe-title">{recipe.title}</div>
      <div className="image-container">
        <img
          src={recipe.image || "/Media/Logo.gif"}
          onError={(e) => {
            setImageError(true);
            e.target.onError = null;
            e.target.src = "/Media/Logo.gif";
          }}
          alt={recipe.title}
          className="recipe-image"
        />
        {imageError && (
          <div className="no-image-text">
            No image found
          </div>
        )}
      </div>
    </button>
  );
};

export default IndiviualBox;
