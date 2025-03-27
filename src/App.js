
import './App.css';
import React, { useState } from 'react';
import GlobalStyle from './GlobalStyle';
import IngredientsBox from './Ingredient_Box/IngredientsBox';
import RecipeBox from './Recipe_Box/RecipeBox';
import Header from './Title_Card/Header';
import TranslateBox from './Title_Card/TranslateBox';
import TTS from './Title_Card/TTS';
import RecipeModal from './Recipe_Box/RecipeModal';


const App = () => {

  // Lift shared state for ingredients, recipes, and selected recipe for modal
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isToggled, setFilterToggle] = useState(false); 
  const [selectedFilters, setSelectedFilter] = useState([]); 
  const [excludedIngredients, setExcludedIngredients] = useState([]);


  // Trigger search using current ingredients list
  const handleSearchRecipes = async () => {
    const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;
    const ingredientsQuery = ingredients.join(',');
    const excludeQuery = excludedIngredients.join(',');
    console.log("Ingredients:", ingredients);
    console.log("Ingredients Query String:", ingredientsQuery);
    console.log("Excluded Ingredients Query String:", excludeQuery);
   
  
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${ingredientsQuery}&number=30&ignorePantry=true`
      );
      let recipes = await response.json();

      if (excludedIngredients.length > 0 || selectedFilters.length > 0) {
        const recipeIds = recipes.map(recipe => recipe.id).join(',');
        const informationResponse = await fetch(
          `https://api.spoonacular.com/recipes/informationBulk?apiKey=${apiKey}&ids=${recipeIds}`
        );
        let detailedRecipes = await informationResponse.json();
  
        // Apply excluded ingredients filter if needed
        if (excludedIngredients.length > 0) {
          detailedRecipes = detailedRecipes.filter(recipe => {
            return !recipe.extendedIngredients.some(ingredient => 
              excludedIngredients.some(excluded => 
                ingredient.name.toLowerCase().includes(excluded.toLowerCase())
              )
            );
          });
        }

        // handle filtering for diets when selected
        if(selectedFilters.length > 0){
          console.log("selected filters", selectedFilters)

          const dietMap = {
            'Vegan': 'vegan',
            'Vegetarian': 'vegetarian',
            'Gluten Free': 'glutenFree',
            'Ketogenic': 'ketogenic',
            'Paleo': 'paleo'
          };

          // filter recipes with selected diets
          detailedRecipes = detailedRecipes.filter(recipe => {
            return selectedFilters.every(diet => recipe[dietMap[diet]])
          });
        }

        recipes = detailedRecipes.map(recipe => ({
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
        }));
      }

      setRecipes(recipes);
      console.log("Recipes fetched:", recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  // Open modal with selected recipe
  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
  };

  // Close recipe modal
  const closeModal = () => {
    setSelectedRecipe(null);
  };

  // show or hide filters
  const filterToggle = () => {
    setFilterToggle((prev) => !prev);
  };

  // toggle diet filters
  const filterOptionToggle = (option, event) => {
    event.stopPropagation();    
    setSelectedFilter((prev) => {
      if(prev.includes(option)){
        return prev.filter(diet => diet !== option)
      } else {
        return prev.concat(option);
      }
    });
    
  };

  return (
    <>
      {/* Sets a global style, sets font to Inria Sans */}
      <GlobalStyle />

      {/* The title card and the adjacent icons */}
      <div className='container'>

        {/* A gif of the app icon */}
        <img
          src={'/Media/Logo.gif'}
          alt="Logo"
          className='logo'
        />

        {/* The website name */}
        <Header />

        {/* Spacer to push language boxes to the right */}
        <div className='spacer'></div>

        {/* The translation box */}
        <TranslateBox/>

        {/* The TTS box*/}
        <TTS/>
      </div>

      {/* The Ingredients box and the Recipe Box */}
      <div className='container'>
        <IngredientsBox 
          ingredients={ingredients}
          setIngredients={setIngredients}
          onSearch={handleSearchRecipes}
        />     

        <RecipeBox 
          recipes={recipes}
          onRecipeClick={handleRecipeClick}
          isToggled={isToggled}
          filterToggle={filterToggle}
          filterOptionToggle={filterOptionToggle}
          selectedFilters={selectedFilters}
          excludedIngredients={excludedIngredients}
          setExcludedIngredients={setExcludedIngredients}
        />        

      </div>
      
      {/* The Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={closeModal} />
      )}
    
  
    </>
  );
};





export default App;