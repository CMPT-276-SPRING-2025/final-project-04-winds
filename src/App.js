import './App.css';
import GlobalStyle from './GlobalStyle';

const App = () => {
  return (
    <>
      <GlobalStyle />
      <Header />
    </>
  );
};

const Header = () => {
  return (
    <header style={{ textAlign: 'center',color: '#85A573',}}>
      <h1 style={{ fontSize: '3rem'}}>CookCompass</h1>
    </header>
  );
};

export default App;