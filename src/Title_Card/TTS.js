import React from 'react';
import './TranslateTTSBox.css'

const TTS = () => {
  return (
    <img
      src={'/Media/Text-To-Speech.png'}
      alt="TTS"
      className='languageBox'
      data-testid='text-to-speech'
    />
  );
};

export default TTS;