import React, { useState, useEffect, useRef, useCallback } from 'react';
import TranslateToEnglish from './TranslateToEnglish'; // Import the language selector
import './InputBox.css';
import { useErrorModal } from '../ErrorModal';

/*
InputBox.js

Component manages the input for entering ingredients.
  - Handles user input and keystrokes.
  - Fetches autocomplete suggestions via the Spoonacular API.
  - Adds or removes ingredients from the list.
  - Integrates a translation feature (TranslateToEnglish) for multilingual search queries.
*/

const InputBox = ({ ingredients, setIngredients, onIngredientsChange }) => {
  const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;
  const googleApiKey = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;
  const containerRef = useRef(null);
  
  // Local state for user input and autocomplete
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [inputLang, setInputLang] = useState('en'); // Default language is English
  const { showErrorModal } = useErrorModal() || {};

  // Function to translate non-English text to English for searching
  // eslint-disable-next-line
  const translateText = useCallback(async (text) => {
    if (!text.trim()) return text;
    
    if (inputLang === 'en') {
      return text;
    }

    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: text,
            target: 'en',
            source: inputLang === 'auto' ? undefined : inputLang, // Avoid 'auto' if not supported
            format: 'text',
          }),
        }
      );
     
      const data = await response.json();
      if (!data.data?.translations?.[0]?.translatedText) {
        throw new Error('Invalid translation response');
      }

      let translatedText = data.data.translations[0].translatedText;

      return translatedText;
    } catch (error) {
      showErrorModal({context:`Translation error 1`, message: "Multilingual Search Queries is not working at the moment. The Google Cloud Translation API is not responding."});
      return text;
    }
  }, [googleApiKey, inputLang, showErrorModal]);
  
  // Fetch suggestions from Spoonacular using the (translated) query
  const fetchSuggestions = useCallback(async (query) => {
    try {
      const translatedQuery = await translateText(query);
      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/autocomplete?apiKey=${apiKey}&query=${translatedQuery}&number=5`
      );


      // Check for error responses
      if (!response.ok) {
        if (response.status === 402) {
          throw new Error("Daily API limit reached. Please try again tomorrow or upgrade your plan.");
        } else {
          throw new Error(`Error fetching suggestions: ${response.statusText}`);
        }
      }

      const data = await response.json();
      setSuggestions(data);
      setSelectedSuggestionIndex(-1);
    } catch (error) {
      showErrorModal({context:`Error fetching suggestions`, message: 'Ingredient input is not working due to the Spoonacular API key being invalid or out of quota.'});
    }
  }, [apiKey, translateText, showErrorModal ]);


  // Update suggestions after user stops typing (300ms debounce)
  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
      return;
    }

    const timer = setTimeout(() => fetchSuggestions(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue, fetchSuggestions]);

  // Scroll the active suggestion into view if necessary
  useEffect(() => {
    if (selectedSuggestionIndex !== -1) {
      const activeItem = document.querySelector('.suggestions-list li.active');
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedSuggestionIndex]);
  

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Add a new ingredient to the list if not already present
  const addIngredient = (ingredientName) => {
    if (ingredientName && !ingredients.includes(ingredientName)) {
      const updatedIngredients = [...ingredients, ingredientName];
      setIngredients(updatedIngredients);
      onIngredientsChange && onIngredientsChange(updatedIngredients);
    }
    // Reset input and suggestions
    setInputValue('');
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
  };
  // Handle key events for navigation and selection of suggestions
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        const indexToAdd = selectedSuggestionIndex === -1 ? 0 : selectedSuggestionIndex;
        addIngredient(suggestions[indexToAdd].name);
      } else if (inputValue.trim() !== '') {
        addIngredient(inputValue.trim());
      }
    }
  };
  // Handle click on a suggestion item
  const handleSuggestionClick = (suggestion) => {
    addIngredient(suggestion.name);
  };
  // Remove an ingredient from the list
  const removeIngredient = (ingredientToRemove) => {
    const updatedIngredients = ingredients.filter(ing => ing !== ingredientToRemove);
    setIngredients(updatedIngredients);
    onIngredientsChange && onIngredientsChange(updatedIngredients);
  };
  // Fetch suggestions when the input gains focus, if there is text
  const handleFocus = () => {
    if (inputValue.trim()) {
      fetchSuggestions(inputValue);
    }
  };
  // Hide suggestions shortly after the input loses focus
  const handleBlur = () => {
    setTimeout(() => {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
    }, 150);
  };

  return (
    <>
      <TranslateToEnglish setSelectedLanguageIn={setInputLang} />
      {/* Main input container */}
      <div className="white-box" data-testid="white-box" ref={containerRef}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Type an ingredient..."
        />
        {/* Display autocomplete suggestions */}
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((sugg, index) => (
              <li
                key={sugg.id || index}
                onClick={() => handleSuggestionClick(sugg)}
                className={index === selectedSuggestionIndex ? 'active' : ''}
              >
                {sugg.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Display the list of added ingredients as "chips" */}
      <div className="ingredient-list">
        {ingredients.map((ingredient, index) => (
          <div key={ingredient + index} className="ingredient-item">
            {ingredient}
            <button onClick={() => removeIngredient(ingredient)}>x</button>
          </div>
        ))}
      </div>
    </>
  );
};

export default InputBox;
