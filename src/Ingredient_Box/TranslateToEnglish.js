import React, { useState, useEffect, useRef } from 'react';
import Languages from '../data/LanguagesforQ';
import './TranslateToEnglish.css';

const TranslateToEnglish = ({ setSelectedLanguageIn }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const containerRef = useRef(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const languageRefs = useRef([]);

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

  // Reset highlighted index when the dropdown is opened
  useEffect(() => {
    if (isDropdownOpen) {
      setHighlightedIndex(-1);
    }
  }, [isDropdownOpen]);

  // Scroll to the highlighted language when it changes
  useEffect(() => {
    if (
      highlightedIndex >= 0 &&
      languageRefs.current[highlightedIndex]
    ) {
      languageRefs.current[highlightedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [highlightedIndex]);

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
        data-testid="language-selector"
        tabIndex="0"
        onClick={() => {
          setIsDropdownOpen(!isDropdownOpen);
        }}
        onKeyDown={(e) => { // Handle keyboard navigation
          if (!isDropdownOpen) return;
      
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev + 1) % Languages.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) =>
              prev <= 0 ? Languages.length - 1 : prev - 1
            );
          } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < Languages.length) {
              handleLanguageSelect(Languages[highlightedIndex].code);
            }
          } else if (e.key === 'Escape') {
            setIsDropdownOpen(false);
          }
        }}
        onBlur={() => { // Hide dropdown when focus is lost
          setTimeout(() => {
            setIsDropdownOpen(false);
          }, 100);
        }}
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
            {Languages.map((lang, index) => (
              <li 
                key={lang.code} 
                onClick={() => handleLanguageSelect(lang.code)} 
                ref={(el) => (languageRefs.current[index] = el)}
                className={highlightedIndex === index ? 'highlighted' : ''}
              >
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
