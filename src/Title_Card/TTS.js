import React, { useState, useEffect, useRef } from 'react';
import './TranslateTTSBox.css';

const TTS = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListening, setIsListening] = useState(false);
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

  const toggleListening = () => {
    setIsListening(!isListening)
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
          <button className="tts-menu-item" onClick={togglePlaying}>
            <svg className="menu-icon" viewBox="0 0 24 24" width="16" height="16">
              {isPlayingAudio ? (
                <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
              ) : (
                <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
              )}
            </svg>
            {isPlayingAudio ? 'Pause' : 'Play'}
          </button>
          <button className="tts-menu-item">
            <svg className="menu-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
              <path fill="currentColor" d="M15,5.14V19.14L19,12.14L15,5.14Z" />
            </svg>
            Skip
          </button>
          <button className="tts-menu-item">
            <svg className="menu-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M6,18.14V5.14H8V18.14H6Z" />
              <path fill="currentColor" d="M9.5,12.14L16,5.64V18.64L9.5,12.14Z" />
            </svg>
            Go Back
          </button>
          <button className="tts-menu-item" onClick={toggleListening}>
            <svg className="menu-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
            </svg>
            {isListening ? 'Stop Listening' : 'Start Listening'}            
          </button>
        </div>
      )}
    </div>
  );
};

export default TTS;