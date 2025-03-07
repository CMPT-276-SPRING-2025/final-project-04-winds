import './App.css';
import GlobalStyle from './GlobalStyle';
import IngredientsBox from './IngredientsBox';
import RecipeBox from './RecipeBox';

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
        <img
          src={'/Media/Translate.png'}
          alt="Translate"
          className='languageBox'
        />

        {/* The TTS box*/}
        <img
          src={'/Media/Text-To-Speech.png'}
          alt="TTS"
          className='languageBox'
        />
      </div>

      {/* The Ingredients box and the Recipe Box */}
      <div className='container'>
        <IngredientsBox />
        <RecipeBox />
      </div>
      

    </>
  );
};


// The title card for the header
const Header = () => {
  return (
    <header className='header'>
      <h1 className='title'>CookCompass</h1>
    </header>
  );
};


export default App;