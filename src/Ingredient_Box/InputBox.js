import React, { useState, useEffect, useRef, useCallback } from 'react';
import './InputBox.css';

const InputBox = ({ onIngredientsChange }) => {
  const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;
  const containerRef = useRef(null);

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Wrap fetchSuggestions in useCallback so it's a stable dependency.
  const fetchSuggestions = useCallback(async (query) => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/autocomplete?apiKey=${apiKey}&query=${query}&number=5`
      );
      const data = await response.json();
      setSuggestions(data);
      setSelectedSuggestionIndex(-1);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, [apiKey]);

  // Debounce input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.trim()) {
        fetchSuggestions(inputValue);
      } else {
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, fetchSuggestions]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const addIngredient = (ingredientName) => {
    if (ingredientName && !ingredients.includes(ingredientName)) {
      const updatedIngredients = [...ingredients, ingredientName];
      setIngredients(updatedIngredients);
      onIngredientsChange && onIngredientsChange(updatedIngredients);
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
        setSelectedSuggestionIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        // If none is selected, default to the first suggestion
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
    const updatedIngredients = ingredients.filter(
      (ingredient) => ingredient !== ingredientToRemove
    );
    setIngredients(updatedIngredients);
    onIngredientsChange && onIngredientsChange(updatedIngredients);
  };

  // When input gains focus, re-fetch suggestions (if there's text)
  const handleFocus = () => {
    if (inputValue.trim()) {
      fetchSuggestions(inputValue);
    }
  };

  // When input loses focus, hide suggestions after a short delay to allow clicks to register
  const handleBlur = () => {
    setTimeout(() => {
      // If the newly focused element is not inside our container, clear suggestions.
      if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    }, 150);
  };

  return (
    <>
      {/* Container for input and suggestions */}
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
      {/* Ingredient list rendered outside the white box */}
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
