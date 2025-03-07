import './App.css';
import GlobalStyle from './GlobalStyle';

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