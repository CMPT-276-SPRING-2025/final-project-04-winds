import './App.css';
import GlobalStyle from './GlobalStyle';
import IngredientsBox from './IngredientsBox';
import RecipeBox from './RecipeBox';

const App = () => {
  return (
    <>
      <GlobalStyle />
      <div className='container'>
        <img
          src={'/Media/Logo.gif'}
          alt="Logo"
          className='logo'
        />

        <Header />

        {/* Spacer to push language boxes to the right */}
        <div className='spacer'></div>

        <img
          src={'/Media/Translate.png'}
          alt="Translate"
          className='languageBox'
        />

        <img
          src={'/Media/Text-To-Speech.png'}
          alt="TTS"
          className='languageBox'
        />
      </div>

      <div className='container'>
        <IngredientsBox />
        <RecipeBox />
      </div>
      

    </>
  );
};

const Header = () => {
  return (
    <header className='header'>
      <h1 className='title'>CookCompass</h1>
    </header>
  );
};


export default App;