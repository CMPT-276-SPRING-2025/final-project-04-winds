import React, { useState, useEffect } from 'react';
import './RecipeModal.css';

const RecipeModal = ({ recipe, onClose }) => {
  const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;
  const [recipeInfo, setRecipeInfo] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [showDetailed, setShowDetailed] = useState(false);

  useEffect(() => {
    const fetchRecipeInfo = async () => {
      try {
        const infoUrl = `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey}&includeNutrition=true`;
        const infoRes = await fetch(infoUrl);
        const infoData = await infoRes.json();

        const stepsUrl = `https://api.spoonacular.com/recipes/${recipe.id}/analyzedInstructions?apiKey=${apiKey}`;
        const stepsRes = await fetch(stepsUrl);
        const stepsData = await stepsRes.json();

        setRecipeInfo({
          ...infoData,
          analyzedInstructions: stepsData
        });
      } catch (error) {
        console.error("Error fetching recipe info:", error);
      }
    };

    if (recipe && recipe.id) {
      fetchRecipeInfo();
    }
  }, [recipe, apiKey]);

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

        {/* Header */}
        <div className="modal-header">
          <h1>{recipe.title}</h1>
          <p style={{ color: 'black' }}>
            Cooking Time: {recipeInfo?.readyInMinutes || recipe.readyInMinutes || 'N/A'} minutes
          </p>
          <p style={{ color: 'black' }}>
            Calories:{' '}
            {recipeInfo?.nutrition?.nutrients.find(n => n.name.toLowerCase() === "calories")?.amount || 'N/A'}
          </p>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Left Column: Instructions */}
          <div className="modal-info">
            <h3><u>Steps:</u></h3>
            <button className="toggle-instructions-btn" onClick={() => setShowDetailed(!showDetailed)}>
              {showDetailed ? 'Show Regular Instructions' : 'Show Detailed Instructions'}
            </button>

            {recipeInfo === null ? (
              <p>Loading instructions...</p>
            ) : showDetailed ? (
              recipeInfo.analyzedInstructions?.length > 0 &&
              recipeInfo.analyzedInstructions[0].steps?.length > 0 ? (
                <ol>
                  {recipeInfo.analyzedInstructions[0].steps.map((step) => (
                    <li key={step.number} style={{ marginBottom: "10px" }}> 
                      {step.step}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>Detailed instructions not available.</p>
              )
            ) : recipeInfo.instructions ? (
              <div dangerouslySetInnerHTML={{ __html: recipeInfo.instructions }} />
            ) : (
              <p>Instructions not available.</p>
            )}
          </div>

          {/* Right Column: Image + Ingredients */}
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
                {recipe.usedIngredients?.map((ing, idx) => (
                  <li
                    key={`used-${idx}`}
                    onClick={() => handleIngredientClick(ing.name)}
                    className={checkedIngredients[ing.name] ? 'ingredient checked' : 'ingredient'}
                  >
                    <span className="checkbox"></span>
                    <span className="ingredient-name">{ing.name}</span>
                  </li>
                ))}
                {recipe.missedIngredients?.map((ing, idx) => (
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
