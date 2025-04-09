import React, { useState, useEffect } from 'react';
import './RecipeModal.css';
import TTS from '../Title_Card/TTS';
import TranslateBox from '../Title_Card/TranslateBox';
import Translation from '../Title_Card/Translation';
import { useErrorModal } from '../ErrorModal';

// component to display recipe information in modal
// recipe - recipe data object
// onClose - function to close modal
const RecipeModal = ({ recipe, onClose }) => {
  const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;

  const [recipeInfo, setRecipeInfo] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [showDetailed, setShowDetailed] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});
  // translation states
  const [selectedLanguageOut, setSelectedLanguageOut] = useState('en'); // Output language
  const [selectedLanguageIn, setSelectedLanguageIn] = useState('en'); // Input language
  const [analyzedInstructions, setAnalyzedInstructions] = useState(null); // step by step/detailed instructions
  const [regularInstructions, setRegularInstructions] = useState(null); //regular instructions
  // error handling
  const { showErrorModal } = useErrorModal() || {};

// Delay modal content appearance
  const [minDelayDone, setMinDelayDone] = useState(false);
  const [modalReady, setModalReady] = useState(false);
  const [progress, setProgress] = useState(0);

  // Delay modal content appearance by 700ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayDone(true);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Mark modal as ready if in testing environment else wait until modal content is ready
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      setModalReady(true);
    } else if (recipeInfo && minDelayDone) {
      setModalReady(true);
    }
  }, [recipeInfo, minDelayDone]);


  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 5 : prev));
    }, 50); // Increase progress every 50ms;
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (modalReady) {
      setProgress(100);
    }
  }, [modalReady]);

  // update translation whenever recipe or selected language changes
  useEffect(() => {
    const translateRecipe = async () => {
      // skip if same language selected
      if (selectedLanguageOut === selectedLanguageIn) {
        return;
      }
      else {
          // translate regular instructions first
          try {
            if(recipeInfo.instructions){
              const regularTranslated = await Translation.regularInstructions(
                recipeInfo.instructions,
                selectedLanguageOut,
                showErrorModal
              );
              setRegularInstructions(regularTranslated);
            }
            // translate detailed instructions
            if(recipeInfo.analyzedInstructions){
              const translated = await Translation.detailedInstructions(
                recipeInfo.analyzedInstructions, 
                selectedLanguageOut,
                showErrorModal
              );
              setAnalyzedInstructions(translated);
            }
          } catch (error) {
            // revert to original instructions if translation fails
              showErrorModal({context:`Translation error 2`, message: "You're going too fast! Google Cloud Translation API is working very hard to provide you with the best translation. Please give it a few seconds to rest before translating again."});
              setAnalyzedInstructions(recipeInfo.analyzedInstructions);
              setRegularInstructions(recipeInfo.instructions);
          } 
    
        }         
    };
    translateRecipe();
}, [recipeInfo, selectedLanguageOut, selectedLanguageIn, showErrorModal]);

  useEffect(() => {
    const fetchRecipeInfo = async () => {
      try {
        // fetch basic recipe information
        const infoUrl = `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey}&includeNutrition=true`;
        const infoRes = await fetch(infoUrl);

        // handle API errors
        if (!infoRes.ok) {
          if (infoRes.status === 402) {
            throw new Error("Daily API limit reached. Please try again tomorrow or upgrade your plan.");
          } else {
            throw new Error(`Error fetching recipe info: ${infoRes.statusText}`);
          }
        }

        const infoData = await infoRes.json();
        // fetch detailed instructions
        const stepsUrl = `https://api.spoonacular.com/recipes/${recipe.id}/analyzedInstructions?apiKey=${apiKey}`;
        const stepsRes = await fetch(stepsUrl);
        // handle API errors
        if (!stepsRes.ok) {
          if (stepsRes.status === 402) {
            throw new Error("Daily API limit reached for instructions. Please try again tomorrow or upgrade your plan.");
          } else {
            throw new Error(`Error fetching recipe instructions: ${stepsRes.statusText}`);
          }
        }

        const stepsData = await stepsRes.json();

        // update state with fetched data
        setRecipeInfo({
          ...infoData,
          analyzedInstructions: stepsData
        });
        // initialize translation states with original data
        setAnalyzedInstructions(stepsData); 
        setRegularInstructions(infoData.instructions);
      } catch (error) {
        showErrorModal({context:`Error fetching recipe info`, message: error.message});
      }
    };

    if (recipe && recipe.id) {
      fetchRecipeInfo();
    }
  }, [recipe, apiKey, showErrorModal]);
  // Handler for toggling the checked state of an ingredient when clicked
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

    // Render a loading screen if modal content isn't ready yet
    if (!modalReady) {
      return (
        <div className="modal-overlay">
          <div className="modal-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Loading... {progress}%</p>
            <div className='loading-bar'>
              <div className='loading-bar-fill' style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      );
    }

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
             {/* link translation component */}
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
                    <span className="ingredient-text">
                      {`${ing.amount ? ing.amount + ' ' : ''}${ing.unit ? ing.unit + ' ' : ''}${ing.name}`.trim().replace(/\s+/g, ' ')}
                    </span>
                  </li>
                ))}
                </ul>
              <h3>Missing Ingredients:</h3>
              <ul>
                {recipe.missedIngredients?.map((ing, idx) => (
                  <li
                    key={`missed-${idx}`}
                    onClick={() => handleIngredientClick(ing.name)}
                    className={checkedIngredients[ing.name] ? 'ingredient checked' : 'ingredient'}
                  >
                    <span className="checkbox"></span>
                    <span className="ingredient-text">
                      {`${ing.amount ? ing.amount + ' ' : ''}${ing.unit ? ing.unit + ' ' : ''}${ing.name}`.trim().replace(/\s+/g, ' ')}
                    </span>

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