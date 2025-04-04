import React, { useState, useEffect } from 'react';
import './RecipeModal.css';
import TTS from '../Title_Card/TTS';
import TranslateBox from '../Title_Card/TranslateBox';
import Translation from '../Title_Card/Translation';

const RecipeModal = ({ recipe, onClose }) => {
  const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;
  const [recipeInfo, setRecipeInfo] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [showDetailed, setShowDetailed] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});
  
  const [selectedLanguageOut, setSelectedLanguageOut] = useState('en');
  const [selectedLanguageIn, setSelectedLanguageIn] = useState('en');
  const [analyzedInstructions, setAnalyzedInstructions] = useState(null);
  const [regularInstructions, setRegularInstructions] = useState(null);
  // const [isTranslating, setIsTranslating] = useState(false);

  // update translation whenever recipe or selected language changes
  useEffect(() => {
    const translateRecipe = async () => {
      if (!recipeInfo?.analyzedInstructions) 
        {
          console.log("No instructions to translate");
          return;
        };
      
      if (selectedLanguageOut === selectedLanguageIn) {
        setAnalyzedInstructions(recipeInfo.analyzedInstructions);
        setRegularInstructions(recipeInfo.instructions);
        return;
      }
      else {
          // setIsTranslating(true);
          try {
            if(recipeInfo.analyzedInstructions){
              const translated = await Translation.detailedInstructions(
                recipeInfo.analyzedInstructions, 
                selectedLanguageOut
              );
              setAnalyzedInstructions(translated);
            }
            if(recipeInfo.instructions){
              const regularTranslated = await Translation.regularInstructions(
                recipeInfo.instructions,
                selectedLanguageOut
              );
              setRegularInstructions(regularTranslated);
            }
          } catch (error) {
              console.error("Translation failed:", error);
              setAnalyzedInstructions(recipeInfo.analyzedInstructions);
              setRegularInstructions(recipeInfo.instructions);
          } 
          // setIsTranslating(false);
        }         
    };
    translateRecipe();
}, [recipeInfo, selectedLanguageOut, selectedLanguageIn]);

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
        setAnalyzedInstructions(stepsData); //initialize with original info
        setRegularInstructions(infoData.instructions);
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

  const toggleStepCompletion = (stepNumber) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  

  return (   
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>X</button>
        
        {/* Header with TTS Component */}
        <div className="modal-header">
          <div className='header-top'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px' }}>
              <h1>{recipe.title}</h1>
            </div>
            <div className="languageBox">              
              <TranslateBox 
                selectedLanguageOut = {selectedLanguageOut}
                setSelectedLanguageOut = {setSelectedLanguageOut}
                setSelectedLanguageIn = {setSelectedLanguageIn}
                selectedLanguageIn = {selectedLanguageIn}
              />
              {recipeInfo?.analyzedInstructions && (
                <TTS 
                  analyzedInstructions={analyzedInstructions}

                />
              )}
              </div>
            </div>
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
              analyzedInstructions?.length > 0 &&
              analyzedInstructions[0].steps?.length > 0 ? (
                <ol>
                  {analyzedInstructions[0].steps.map((step) => (
                    <li key={step.number} onClick={() => toggleStepCompletion(step.number)} className={completedSteps[step.number] ? "completed-step" : ""} style={{ marginBottom: "10px", cursor: "pointer" }}> 
                      {step.step}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>Detailed instructions not available.</p>
              )
            ) : regularInstructions ? (
              <div dangerouslySetInnerHTML={{ __html: regularInstructions }} />
            ) : (
              <p>Instructions not available.</p>
            )}
          </div>

          {/* Right Column: Image + Ingredients */}
          <div className="modal-right">
              <div className="modal-image-container">
                <img
                  src={recipe.image || "/Media/Logo.gif"}
                  alt={recipe.title || "No image available"}
                  onError={(e) => {
                    e.target.onError = null;
                    e.target.src = "/Media/Logo.gif";
                  }}
                  className="modal-image"
                />
              </div>
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