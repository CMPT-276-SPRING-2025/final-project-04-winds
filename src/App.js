import './App.css';
import GlobalStyle from './GlobalStyle';
import IngredientsBox from './Ingredient_Box/IngredientsBox';
import RecipeBox from './Recipe_Box/RecipeBox';
import Header from './Title_Card/Header';
import TranslateBox from './Title_Card/TranslateBox';
import TTS from './Title_Card/TTS';

const App = () => {
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
        <IngredientsBox />
        <RecipeBox />
      </div>
      

    </>
  );
};





export default App;