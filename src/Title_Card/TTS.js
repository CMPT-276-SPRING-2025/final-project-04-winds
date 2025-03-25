import React, { useState, useEffect, useRef } from 'react';
import './TranslateTTSBox.css';

const TTS = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  };

  const togglePlaying = () => {
    setIsPlayingAudio(!isPlayingAudio)
  }

  return (
    <div className="tts-container">
      <button className='image-button' onClick={toggleMenu}>
        <img
          src={'/Media/Text-To-Speech.png'}
          alt="TTS"
          className='image-button'
          data-testid='text-to-speech'
        />
      </button>
      
      {isMenuOpen && (
        <div className="tts-menu" ref={menuRef}>
          <button 
            className="tts-menu-item" 
            onClick={togglePlaying}
          >
            {isPlayingAudio ? 'Pause' : 'Play'}
          </button>

          <button className="tts-menu-item">Skip</button>

          <button className="tts-menu-item">Go Back</button>

          <button className="tts-menu-item">Detect Input</button>
        </div>
      )}
    </div>
  );
};

export default TTS;