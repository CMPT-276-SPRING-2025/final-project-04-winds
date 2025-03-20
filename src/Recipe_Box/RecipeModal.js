import React, { useState, useEffect } from 'react';
import './RecipeModal.css';

const RecipeModal = ({ recipe, onClose }) => {
  const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;
  const [recipeInfo, setRecipeInfo] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  useEffect(() => {
    const fetchRecipeInfo = async () => {
      try {
        const url = `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey}&includeNutrition=true`;
        const response = await fetch(url);
        const data = await response.json();
        setRecipeInfo(data);
      } catch (error) {
        console.error("Error fetching recipe info:", error);
      }
    };

    if (recipe && recipe.id) {
      fetchRecipeInfo();
    }
  }, [recipe, apiKey]);

  // Toggle the checked state of an ingredient
  const handleIngredientClick = (ingredientName) => {
    setCheckedIngredients((prevState) => ({
      ...prevState,
      [ingredientName]: !prevState[ingredientName],
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>X</button>

        {/* Full-width red header */}
        <div className="modal-header">
          <h1>{recipe.title}</h1>
          <p style={{ color: 'black' }}>
            Cooking Time: {recipeInfo && recipeInfo.readyInMinutes ? recipeInfo.readyInMinutes + ' minutes' : recipe.readyInMinutes ? recipe.readyInMinutes + ' minutes' : 'N/A'}
          </p>
          <p style={{ color: 'black' }}>
            Calories:{' '}
            {recipeInfo && recipeInfo.nutrition
              ? recipeInfo.nutrition.nutrients.find(n => n.name.toLowerCase() === "calories")?.amount
              : 'N/A'}
          </p>
        </div>

        {/* Two-column body */}
        <div className="modal-body">
          {/* Left column for instructions */}
          <div className="modal-info">
            <h3><u>Steps:</u></h3>
            { recipeInfo === null ? (
              <p>Loading instructions...</p>
            ) : recipeInfo.instructions ? (
              <div dangerouslySetInnerHTML={{ __html: recipeInfo.instructions }} />
            ) : (
              <p>Instructions not available.</p>
            )}
          </div>

          {/* Right column for image and ingredients */}
          <div className="modal-right">
            {recipe.image && (
              <div className="modal-image-container">
                <img
                  src={recipe.image || "/Media/Logo.gif"}
                  onError={(e) => {
                    e.target.onError = null;
                    e.target.src = "/Media/Logo.gif";
                  }}
                  alt={recipe.title}
                  className="modal-image"
                />
              </div>
            )}
            <div className="modal-ingredients">
                <h3>Ingredients:</h3>
                <ul>
                    {recipe.usedIngredients && recipe.usedIngredients.map((ing, idx) => (
                    <li 
                        key={`used-${idx}`} 
                        onClick={() => handleIngredientClick(ing.name)}
                        className={checkedIngredients[ing.name] ? 'ingredient checked' : 'ingredient'}
                    >
                        <span className="checkbox"></span>
                        <span className="ingredient-name">{ing.name}</span>
                    </li>
                    ))}
                    {recipe.missedIngredients && recipe.missedIngredients.map((ing, idx) => (
                    <li 
                        key={`missed-${idx}`} 
                        onClick={() => handleIngredientClick(ing.name)}
                        className={checkedIngredients[ing.name] ? 'ingredient checked' : 'ingredient'}
                    >
                        <span className="checkbox"></span>
                        <span className="ingredient-name">{ing.name}</span>
                    </li>
                    ))}
                </ul>
                </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
