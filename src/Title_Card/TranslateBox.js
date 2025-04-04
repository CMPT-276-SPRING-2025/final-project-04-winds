import React, { useState, useRef, useEffect} from 'react';
import Languages from '../data/Languages';
import './TranslateTTSBox.css';

const TranslateBox = ({selectedLanguageOut, setSelectedLanguageOut, selectedLanguageIn, setSelectedLanguageIn}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDropdownOut, setDropdownOut] = useState(false);
 
  const menuRef = useRef(null);
  const selectLanguageRef = useRef(null);
  
// handle menu visibility 
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  }

// handle language dropdown visibility
  const toggleDropdown = () => {
      setDropdownOut(!isDropdownOut);
  }

  // get language name for display from code
  const getLanguageName = (code) => {
    const language = Languages.find(language => language.code === code);
    return language ? language.name : 'Unknown';
  }

  // handle input from dropdown
  const handleLanguageSelect = (languageCode, type) => {
    if (type === 'in'){
      setSelectedLanguageIn(languageCode);
    } else {
      setSelectedLanguageOut(languageCode);
    }
    setDropdownOut(false);
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside, true);
    window.addEventListener('touchstart', handleClickOutside, true);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside, true);
      window.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, []);

  // Close the output language dropdown if clicking outside its container
  useEffect(() => {
    const handleClickOutsideSelect = (event) => {
      if (selectLanguageRef.current && !selectLanguageRef.current.contains(event.target)) {
        setDropdownOut(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutsideSelect, true);
    window.addEventListener('touchstart', handleClickOutsideSelect, true);
    return () => {
      window.removeEventListener('mousedown', handleClickOutsideSelect, true);
      window.removeEventListener('touchstart', handleClickOutsideSelect, true);
    };
  }, []);


  // render
  return (
    <div className='translate-button-container'>
    <div className="translate-button" ref={menuRef} style={{ position: 'relative', display:'inline-block'}}>
      {/* translate icon button */}
      <button className={`image-button ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <div className='image-container'>
          <img
            src={'/Media/Translate.png'}
            alt="Translate"
            data-testid="translate"
            className='image-button'
          />
        </div>
      </button>
  
      {/* translate menu */}
      {isMenuOpen && (
        <div className="translate-menu">
          {/* left language */}
          <span className="language-name">{getLanguageName(selectedLanguageIn)}</span>
  
          {/* middle arrow */}
          <img
            src="/Media/Arrow.png"
            alt="Arrow"
            className="translate-arrow"
          />
  
          {/* right language */}
          <div className="language-dropdown-container" ref={selectLanguageRef}>
            <span className="select-language" onClick={() => toggleDropdown()}>
              {getLanguageName(selectedLanguageOut) ||
                'Select Language'}
                {/* rotating arrow */}
                <img 
                  src="/Media/arrowDown.png" 
                  alt="Arrow" 
                  className={`dropdown-arrow ${isDropdownOut ? 'open' : ''}`} 
                />
              </span>
            {isDropdownOut && (
              <div className="Modal-language-dropdown">
                <ul className="language-list">
                  {Languages.map((lang) => (
                    <li
                      key={lang.code}
                      className={`language-item ${
                        selectedLanguageOut === lang.code ? 'selected' : ''
                      }`}
                      onClick={() => handleLanguageSelect(lang.code, 'out')}
                    >
                      <span className="language-name">{lang.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default TranslateBox;