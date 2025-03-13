import React from 'react';
import './Header.css';

// The title card for the header
const Header = () => {
    return (
      <header className='header' data-testid='header'>
        <h1 className='title' data-testid='title'>CookCompass</h1>
      </header>
    );
  };

export default Header;