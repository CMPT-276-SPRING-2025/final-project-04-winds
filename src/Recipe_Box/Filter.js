import React, {useState} from 'react';
import './Filter.css'

const Filter = ({isToggled, filterToggle, filterOptionToggle, selectedFilters}) => {
  const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;
  
  const [excludePopupVisible, setPopupVisible] = useState(false);
  const [ingredient, setIngredient] = useState('');
  const [ingredientsList, setIngredientsList] = useState([]);

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
    

  const addIngredient = (event) => {
    event.stopPropagation();
    if (ingredient.trim()) {
      setIngredientsList([...ingredientsList, ingredient]); //add ingredient to list
      setIngredient(''); // clear input field after adding
    }
  };

  const removeIngredient = (removedIngredient) => {
    const updatedIngredientList = ingredientsList.filter(ingredient => ingredient !== removedIngredient);
    setIngredientsList(updatedIngredientList);
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
                  {ingredientsList.map((ingredient, index) => (
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
                  <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                  <button onClick={closePopup} className='close-popup'>x</button>
                    <h2>Exclude Ingredients</h2>
                    <input
                      type="text"
                      value={ingredient}
                      onChange={handleInputChange}
                      placeholder="Type an ingredient"
                    />
                    <button onClick={addIngredient}>Add</button>
                    

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