import './App.css';

function App() {
  return (
    <div>
      <Header></Header>
    </div>
  );
}

const Header = () => {
  return (
    <header style={{
      textAlign: 'center',
      color: '#85A573',
      fontFamily: "'Inria Sans', sans-serif",
      }}>

      <h1 style={{ fontSize: '3rem'}}>CookCompass</h1>

    </header>
  );
};
export default App;