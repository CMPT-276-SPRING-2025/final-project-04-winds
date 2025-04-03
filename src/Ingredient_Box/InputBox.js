import React, { useState, useEffect, useRef, useCallback } from 'react';
import TranslateToEnglish from './TranslateToEnglish'; // Import the language selector
import './InputBox.css';

const InputBox = ({ ingredients, setIngredients, onIngredientsChange }) => {
  const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;
  const googleApiKey = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;
  const containerRef = useRef(null);

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [inputLang, setInputLang] = useState('en'); // Default to English

  const translateText = async (text) => {
    if (!text.trim()) return text;
  
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

      let detectedLang = data.data.translations[0].detectedSourceLanguage;
      let translatedText = data.data.translations[0].translatedText;

      console.log(`Detected language: ${detectedLang} (User selected: ${inputLang})`);
      console.log(`Translated "${text}" to "${translatedText}"`);

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };
  

  const fetchSuggestions = useCallback(async (query) => {
    try {
      const translatedQuery = await translateText(query);
      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/autocomplete?apiKey=${apiKey}&query=${translatedQuery}&number=5`
      );
      const data = await response.json();
      console.log('Suggestions received:', data);  // Debugging line
      setSuggestions(data);
      setSelectedSuggestionIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, [apiKey, inputLang]);

  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
      return;
    }

    const timer = setTimeout(() => fetchSuggestions(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue, fetchSuggestions]);

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

  // Use the parent's ingredients state instead of local state.
  const addIngredient = (ingredientName) => {
    if (ingredientName && !ingredients.includes(ingredientName)) {
      const updatedIngredients = [...ingredients, ingredientName];
      setIngredients(updatedIngredients);
      // Optionally, call the parent's onIngredientsChange callback if provided.
      onIngredientsChange && onIngredientsChange(updatedIngredients);
      console.log("Updated ingredients from InputBox:", updatedIngredients);
    }
    setInputValue('');
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
  };

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

  const handleSuggestionClick = (suggestion) => {
    addIngredient(suggestion.name);
  };

  const removeIngredient = (ingredientToRemove) => {
    const updatedIngredients = ingredients.filter(ing => ing !== ingredientToRemove);
    setIngredients(updatedIngredients);
    onIngredientsChange && onIngredientsChange(updatedIngredients);
  };

  const handleFocus = () => {
    if (inputValue.trim()) {
      fetchSuggestions(inputValue);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
    }, 150);
  };

  return (
    <>
      <TranslateToEnglish setSelectedLanguageIn={setInputLang} />
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
