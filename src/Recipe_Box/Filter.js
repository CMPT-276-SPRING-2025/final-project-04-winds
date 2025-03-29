import React, { useState, useEffect, useCallback } from 'react';
import './Filter.css'

const Filter = ({isToggled, filterToggle, filterOptionToggle, selectedFilters, excludedIngredients, setExcludedIngredients}) => {
  
  const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;

  const [excludePopupVisible, setPopupVisible] = useState(false);
  const [ingredient, setIngredient] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const dietOptions = ['Vegan', 'Vegetarian', 'Gluten Free', 'Ketogenic', 'Paleo'];

  const openPopup = (event) => {
    event.stopPropagation();
    setPopupVisible(true); 
  }
  const closePopup = (event) => {
    event.stopPropagation();
    setPopupVisible(false);
  }
  const handleInputChange = (event) => {
    event.stopPropagation();
    setIngredient(event.target.value);
  }

  const addIngredient = (ingredient) => {
    if (ingredient.trim() && !excludedIngredients.includes(ingredient.trim())) {
      setExcludedIngredients([...excludedIngredients, ingredient.trim()]);
      setIngredient('');
    }
  };

  const removeIngredient = (removedIngredient) => {
    setExcludedIngredients(
      excludedIngredients.filter(item => item !== removedIngredient)
    );
  };

  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    
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
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (ingredient.trim()) {
        fetchSuggestions(ingredient);
      } else {
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [ingredient, fetchSuggestions]);
  
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        const indexToAdd = selectedSuggestionIndex === -1 ? 0 : selectedSuggestionIndex;
        addIngredient(suggestions[indexToAdd].name);
      } else if (ingredient.trim() !== '') {
        addIngredient(ingredient.trim());
      }
      setSuggestions([]);
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    addIngredient(suggestion.name);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setSuggestions([]);
    }, 150);
  };

  return (
    // button toggle
    <div className='filter-container' >
      <img
          src={isToggled ? '/Media/b-Filter.png' : '/Media/Filter.png'}
          alt="Filter"
          className='filter'
          data-testid="filter"
          onClick={filterToggle}
      />

    {/* toggle filter option buttons */}
      {isToggled ? (
        <div className='filter-options'> 
        {/* loop over each element in diet options to check if its selected & update buttons*/}
          {dietOptions.map((option) => (
            <button 
              key = {option}
              className={`filter-button ${selectedFilters.includes(option) ? 'selected': ''}`} 
              onClick={(event) => {
                event.stopPropagation();
                filterOptionToggle(option, event)}}
            > {option} </button>
          ))}
            
          <div>
            <div  className='exclude-container' > 
                <h3>Ingredients to exclude:</h3>
                <button className="exclude-button" onClick={openPopup}>+</button>

                <div className="ingredient-list">
                  {excludedIngredients.map((ingredient, index) => (
                    <div key={`${ingredient}-${index}`} className="ingredient-item">
                      {ingredient}
                      <button 
                        onClick={() => removeIngredient(ingredient)}
                       
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
            </div>

              {excludePopupVisible && (
                <div className="popup" onClick={closePopup}>
                  <div className="popup-content" onClick={(e) => e.stopPropagation()} data-testid="popup-content">
                  <button onClick={closePopup} className='close-popup'>x</button>
                    <h2>Exclude Ingredients</h2>
                    <input className='exclude-input'
                      type="text"
                      value={ingredient}
                      onChange={handleInputChange}
                      placeholder="Type an ingredient..."
                      onKeyDown={handleKeyDown}
                      onBlur={handleBlur}
                    />
                    {/* <button onClick={addIngredient}>Add</button> */}

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
                </div>
              )}
            </div>
        </div>
      ):null}

    </div>

    
  );
};

export default Filter;