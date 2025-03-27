
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

  // Trigger search using current ingredients list
  const handleSearchRecipes = async () => {
    const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;
    const ingredientsQuery = ingredients.join(',');
    console.log("Ingredients:", ingredients);
    console.log("Ingredients Query String:", ingredientsQuery);
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${ingredientsQuery}&number=30&ignorePantry=true`
      );
      const data = await response.json();
      setRecipes(data);
      console.log("Recipes fetched:", data);
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