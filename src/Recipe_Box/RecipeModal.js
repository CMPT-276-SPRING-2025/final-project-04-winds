import React, { useState, useEffect } from 'react';
import './RecipeModal.css';

const RecipeModal = ({ recipe, onClose }) => {
  const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;
  const [instructions, setInstructions] = useState(null);
  const [recipeInfo, setRecipeInfo] = useState(null);

  useEffect(() => {
    const fetchRecipeInfo = async () => {
      try {
        const url = `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey}&includeNutrition=true`;
        const response = await fetch(url);
        const data = await response.json();
        console.log("Full recipe info:", data);
        setRecipeInfo(data);
        // You can decide how to parse/display instructions from data.instructions
        if (data.instructions && data.instructions.trim() !== "") {
          setInstructions([{ steps: [{ number: 1, step: data.instructions }] }]);
        } else {
          setInstructions([]);
        }
      } catch (error) {
        console.error("Error fetching recipe info:", error);
      }
    };
  
    if (recipe && recipe.id) {
      fetchRecipeInfo();
    }
  }, [recipe.id, apiKey]);
  

  // Use recipeInfo if available for detailed fields; otherwise, fallback to recipe prop
  const readyInMinutes = (recipeInfo && recipeInfo.readyInMinutes !== undefined && recipeInfo.readyInMinutes !== null)
    ? recipeInfo.readyInMinutes
    : recipe.readyInMinutes;

  let calories = null;
  if (recipeInfo && recipeInfo.nutrition && recipeInfo.nutrition.nutrients) {
    console.log("Nutrients:", recipeInfo.nutrition.nutrients);
    // Do a case-insensitive check for the "calories" nutrient
    const calNutrient = recipeInfo.nutrition.nutrients.find(n => n.name.toLowerCase() === "calories");
    if (calNutrient && calNutrient.amount !== undefined && calNutrient.amount !== null) {
      calories = calNutrient.amount;
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>X</button>
        <h2>{recipe.title}</h2>
        <p>
          <strong>Cooking Time:</strong> {readyInMinutes !== undefined && readyInMinutes !== null ? readyInMinutes + ' minutes' : 'N/A'}
        </p>
        <p>
          <strong>Calories:</strong> {calories !== undefined && calories !== null ? calories : 'N/A'}
        </p>
        <h3>Ingredients:</h3>
        <ul>
          {recipe.usedIngredients && recipe.usedIngredients.map((ing, idx) => (
            <li key={idx}>{ing.name}</li>
          ))}
          {recipe.missedIngredients && recipe.missedIngredients.map((ing, idx) => (
            <li key={idx}>{ing.name}</li>
          ))}
        </ul>
        <h3>Instructions:</h3>
        { recipeInfo === null ? (
            <p>Loading instructions...</p>
        ) : recipeInfo.instructions ? (
            <div dangerouslySetInnerHTML={{ __html: recipeInfo.instructions }} />
        ) : (
            <p>Instructions not available.</p>
        )}
        </div>
    </div>
    );
};

export default RecipeModal;
