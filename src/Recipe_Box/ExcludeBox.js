import React, {useState} from 'react';
import './ExcludeBox.css'

const ExcludeBox = ({}) => {
    const [excludePopupVisible, setPopupVisible] = useState(false);
    const [ingredient, setIngredient] = useState('');
    const [ingredientsList, setIngredientsList] = useState([]);
    
    const openPopup = (event) => {
        event.stopPropagation()
        setPopupVisible(true); 
      }
    const closePopup = () => setPopupVisible(false);
    const handleInputChange = (event) => setIngredient(event.target.value);

    const addIngredient = (event) => {
    event.stopPropagation()
    if (ingredient.trim()) {
        setIngredientsList([...ingredientsList, ingredient]); //add ingredient to list
        setIngredient(''); // clear input field after adding
        closePopup(); // close popup after adding
    }
    };

    return (
        <div className="App">
            <div onClick={openPopup} className='exclude-container'> 
                <h3>Ingredients to exclude:</h3>
                <button className="exclude-button" >Add</button>
            </div>

              
              {excludePopupVisible && (
                <div className="popup">
                  <div className="popup-content">
                    <h2>Add an Ingredient</h2>
                    <input
                      type="text"
                      value={ingredient}
                      onChange={handleInputChange}
                      placeholder="Type an ingredient"
                    />
                    <button onClick={addIngredient}>Add Ingredient</button>
                    <button onClick={closePopup}>Close</button>
                  </div>
                </div>
              )}

              {/* Display the list of ingredients */}
              <div>
                {/* <h3>Ingredients List:</h3> */}
                <ul>
                  {ingredientsList.map((ing, index) => (
                    <li key={index}>{ing}</li>
                  ))}
                </ul>
              </div>
        </div>
    );
};

export default ExcludeBox;