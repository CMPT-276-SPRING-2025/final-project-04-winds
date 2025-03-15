import React, { useState, useEffect, useRef } from 'react';
import './InputBox.css';

const InputBox = ({ onIngredientsChange }) => {
  const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // 1) Create a ref for the container that holds the input and suggestions
  const containerRef = useRef(null);

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (query) => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/autocomplete?apiKey=${apiKey}&query=${query}&number=5`
      );
      const data = await response.json();
      setSuggestions(data);
      setSelectedSuggestionIndex(-1); // Reset the highlight
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  // Debounce input changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (inputValue.trim()) {
        fetchSuggestions(inputValue);
      } else {
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue]);

  // 2) Hide suggestions if the user clicks outside the container
  useEffect(() => {
    function handleClickOutside(e) {
      // If click is outside of this container, clear suggestions
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // 3) If user focuses back on the input and there's still text, re-fetch suggestions
  const handleFocus = () => {
    if (inputValue.trim()) {
      fetchSuggestions(inputValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestionIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          return nextIndex >= suggestions.length ? 0 : nextIndex;
        });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedSuggestionIndex((prevIndex) => {
          const nextIndex = prevIndex - 1;
          return nextIndex < 0 ? suggestions.length - 1 : nextIndex;
        });
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

  return (
    <>
      {/* Container for the input & suggestions with a ref */}
      <div className="white-box" data-testid="white-box" ref={containerRef}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}  // Re-fetch suggestions on focus
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

      {/* Ingredient list outside the white box */}
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
