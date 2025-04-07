import React, { useState, useEffect, useCallback } from 'react';
import './Filter.css'
import { useErrorModal } from '../ErrorModal';

// main filter component handling features for diet filters and ingredient exclusion
// isToggled (boolean) - Whether the filter panel is currently visible
// filterToggle (function)- Toggles the main filter visibility
// filterOptionToggle (function)- Handles individual filter option selection
// selectedFilters (array)- Currently selected dietary filters
// excludedIngredients (array)- List of excluded ingredients
// setExcludedIngredients (function) - Updates the excluded ingredients list
const Filter = ({isToggled, filterToggle, filterOptionToggle, selectedFilters, excludedIngredients, setExcludedIngredients}) => {
  // spoonacular API key
  const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;
  // state variables
  const [excludePopupVisible, setPopupVisible] = useState(false); // control popup visibility
  const [ingredient, setIngredient] = useState(''); // current input for ingredient to exclude
  const [suggestions, setSuggestions] = useState([]); //autocomplete suggestions
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1); //track selected suggestion
  const { showErrorModal } = useErrorModal() || {};  // Error modal display function

  // available diet filter options
  const dietOptions = ['Vegan', 'Vegetarian', 'Gluten Free', 'Ketogenic', 'Paleo'];

  // control exclude ingredient popup
  // event - click event
  const openPopup = (event) => {
    event.stopPropagation(); // Prevent event bubbling
    setPopupVisible(true); 
  }
  const closePopup = (event) => {
    event.stopPropagation();
    setPopupVisible(false);
  }

  // handle input change in exclude ingredients popup
  // event - input change event
  const handleInputChange = (event) => {
    event.stopPropagation();
    setIngredient(event.target.value);
  }

  // adding an ingredient to excluded list
  // ingredient (string)- Ingredient name to add
  const addIngredient = (ingredient) => {
    if (ingredient.trim() && !excludedIngredients.includes(ingredient.trim())) { // check for duplicates
      setExcludedIngredients([...excludedIngredients, ingredient.trim()]);
      setIngredient(''); //clear input after adding
    }
  };
  
  // removing ingredient from excluded list
  // removedIngredient (string) - Ingredient name to remove
  const removeIngredient = (removedIngredient) => {
    setExcludedIngredients(
      excludedIngredients.filter(item => item !== removedIngredient)
    );
  };

  // fetch autocomplete suggestions from Spoonacular API for excluded ingredient input
  // query (string) - Search term for suggestions
  const fetchSuggestions = useCallback(async (query) => {
    // skip empty queries
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/autocomplete?apiKey=${apiKey}&query=${query}&number=5`
      );

      // Check for errors, e.g. API limit reached
      if (!response.ok) {
        if (response.status === 402) {
          throw new Error("Daily API limit reached. Please try again tomorrow.");
        } else {
          throw new Error(`Error fetching suggestions: ${response.statusText}`);
        }
      }


      const data = await response.json();
      setSuggestions(data);
      setSelectedSuggestionIndex(-1);
    } catch (error) {
      showErrorModal({context:`Error fetching suggestions`, message: 'Exclude ingredients is not working due to the Spoonacular API key being invalid or out of quota.'});
    }
  }, [apiKey, showErrorModal]);
  
  // delay autocomplete API call whenever ingredient input is updated to avoid excessive calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (ingredient.trim()) {
        fetchSuggestions(ingredient);
      } else {
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    }, 300); //300ms delay
    return () => clearTimeout(timer);
  }, [ingredient, fetchSuggestions]);
  
  // handle keyboard navigation through autocomplete suggestions 
  // arrows can navigate through list
  // enter can be used to confirm input
  // e - Keyboard event
  const handleKeyDown = (e) => {
    // handle cycling through suggestions downward
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
    // handle cycling through suggestions upward
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        // add selected suggestion or first one if none selected
        const indexToAdd = selectedSuggestionIndex === -1 ? 0 : selectedSuggestionIndex;
        addIngredient(suggestions[indexToAdd].name);
      } else if (ingredient.trim() !== '') {
        // Add typed text input if no suggestions
        addIngredient(ingredient.trim());
      }
      setSuggestions([]); //clear suggestions
    }
  };
  
  // handle clicking on autocomplete suggestion
  // suggestion - Selected suggestion object
  const handleSuggestionClick = (suggestion) => {
    addIngredient(suggestion.name);
  };

  // delay blur event to allow user to click suggestion
  const handleBlur = () => {
    setTimeout(() => {
      setSuggestions([]);
    }, 150);
  };

  // render
  return (
    // main filter container
    <div className='filter-container' >
      {/* handle filter button toggle, with different image reflecting state of filter visibility */}
      <img
          src={ process.env.NODE_ENV === 'test'
            ? (isToggled ? '/Media/b-Filter.png' : '/Media/Filter.png')
            : (isToggled ? '/Media/b-Filter.png' : '/Media/Filter.png') + `?v=${isToggled}`
          }
          alt="Filter"
          className='filter'
          data-testid="filter"
          onClick={filterToggle}
      />

    {/*  filter option buttons visible when filter is toggled */}
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
            
            {/* excluded ingredients feature */}
          <div>
            <div  className='exclude-container' > 
                <h3>Ingredients to exclude:</h3>
                <button className="exclude-button" onClick={openPopup}>+</button>

                {/* render list of excluded ingredients with cancel button */}
                <div className="excludedIngredient-list">
                  {excludedIngredients.map((ingredient, index) => (
                    <div key={`${ingredient}-${index}`} className="excludedIngredient-item">
                      {ingredient}
                      <button 
                        onClick={() => removeIngredient(ingredient)}
                      >x</button>
                    </div>
                  ))}
                </div>
            </div>

              {/* popup for adding excluded ingredients, visible on toggle */}
              {excludePopupVisible && (
                <div className="popup" onClick={closePopup}>
                  <div className="popup-content" onClick={(e) => e.stopPropagation()} data-testid="popup-content">
                  {/* render popup  */}
                  <button onClick={closePopup} className='close-popup'>x</button>
                    
                    <h2>Exclude Ingredients</h2>
                    {/* ingredient input field */}
                    <input className='exclude-input'
                      type="text"
                      value={ingredient}
                      onChange={handleInputChange}
                      placeholder="Type an ingredient..."
                      onKeyDown={handleKeyDown}
                      onBlur={handleBlur}
                    />
                    
                    {/* render autocomplete suggestions */}
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