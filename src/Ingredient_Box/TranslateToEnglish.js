import React, { useState, useEffect, useRef } from 'react';
import Languages from '../data/LanguagesforQ';
import './TranslateToEnglish.css';

const TranslateToEnglish = ({ setSelectedLanguageIn }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const containerRef = useRef(null);

  // handle menu visibility when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
  
    window.addEventListener('mousedown', handleClickOutside, true);
    window.addEventListener('touchstart', handleClickOutside, true);
  
    return () => {
      window.removeEventListener('mousedown', handleClickOutside, true);
      window.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, []);

  const getLanguageName = (code) => {
    if (code === 'auto') return 'Auto-detect';
    const language = Languages.find((lang) => lang.code === code);
    return language ? language.name : 'Unknown';
  };

  const handleLanguageSelect = (languageCode) => {
    setSelectedLanguage(languageCode);
    setSelectedLanguageIn(languageCode);
    setIsDropdownOpen(false);
  };

  return (
    <div className="translate-container" ref={containerRef}>
  <span 
    className="select-language" 
    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
  >
    Input Language:
    <span className="language-name">{getLanguageName(selectedLanguage)}</span>
    <img 
      src="/Media/arrowDown.png" 
      alt="Arrow" 
      className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} 
    />
  </span>
  {isDropdownOpen && (
    <div className="language-dropdown">
      <ul className="language-list">
        {Languages.map((lang) => (
          <li key={lang.code} onClick={() => handleLanguageSelect(lang.code)}>
            {lang.name}
          </li>
        ))}
      </ul>
    </div>
  )}
</div>
  );
};

export default TranslateToEnglish;
