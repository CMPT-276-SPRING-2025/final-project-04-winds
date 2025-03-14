import React from 'react';
import './TranslateTTSBox.css'

const TranslateBox = () => {
  return (
    <img
      src={'/Media/Translate.png'}
      alt="Translate"
      className='languageBox'
      data-testid='translate'
    />
  );
};

export default TranslateBox;