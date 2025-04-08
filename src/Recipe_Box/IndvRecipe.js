import React, { useState } from 'react';
import './Recipes.css';

// Component for displaying an individual recipe card
// Props:
// - recipe: Object with properties such as title and image.
// - onClick: Function to handle click events on the recipe card.

const IndiviualBox = ({ recipe, onClick }) => {
  // State to track if the image fails to load
  const [imageError, setImageError] = useState(false);

  return (  
    <button
      type="button"
      className="box" // Styling class for recipe card
      data-testid='box'
      onClick={onClick}
    >
      <div className="recipe-title" data-testid="title">{recipe.title}</div>
      <div className="image-container">
        <img          
          src={recipe.image || "/Media/Logo.gif"} // Default image if recipe image is not available
          onError={(e) => {
            setImageError(true);
            e.target.onError = null; // Prevents infinite loop of error handling
            e.target.src = "/Media/Logo.gif";
          }}
          alt={recipe.title} // Alt text for image
          data-testid="image"
          className="recipe-image"
        />
        {imageError && ( // additional text if image fails to load
          <div className="no-image-text">
            No image found
          </div>
        )}
      </div>
    </button>
  );
};

export default IndiviualBox;
