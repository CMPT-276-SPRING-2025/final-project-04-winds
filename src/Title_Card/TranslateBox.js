import React, { useState, useRef, useEffect} from 'react';
import Languages from '../data/Languages';
import './TranslateTTSBox.css';

//  selectedLanguageOut and selectedLanguageIn - strings that represent currently selected language code
//  setSelectedLanguageOut and setSelectedLanguageIn - functions for setting output/input language 
const TranslateBox = ({selectedLanguageOut, setSelectedLanguageOut, selectedLanguageIn, setSelectedLanguageIn}) => {
  // states for translation UI 
  const [isMenuOpen, setMenuOpen] = useState(false); // control menu visibility
  const [isDropdownOut, setDropdownOut] = useState(false); // control language dropdown visibility
//  refs for detecting clicks outside components
  const menuRef = useRef(null); // translation menu ref
  const selectLanguageRef = useRef(null); // language dropdown ref
  
// handle menu visibility 
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  }

// handle language dropdown visibility
  const toggleDropdown = () => {
      setDropdownOut(!isDropdownOut);
  }

  // get language name (string) from language code (string)
  // returns full language name or unknown if language wasn't found
  const getLanguageName = (code) => {
    const language = Languages.find(language => language.code === code);
    return language ? language.name : 'Unknown';
  }

  // handle language selection from dropdown for input and output languages
  // languageCode - selected languagd code (string)
  // type - either 'in' or 'out' string for input and output respectively
  const handleLanguageSelect = (languageCode, type) => {
    if (type === 'in'){
      setSelectedLanguageIn(languageCode);
    } else {
      setSelectedLanguageOut(languageCode);
    }
    setDropdownOut(false); // close dropdown after selection
  }

  // Close menu when clicking outside 
  // event - mouse event
  useEffect(() => {
    const handleClickOutside = (event) => {
      // check if click is outside menu
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    // add and clean up event listeners for mouse clicking 
    window.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, []);

  // Close the output language dropdown if clicking outside its container
  // event - mouse event
  useEffect(() => {
    const handleClickOutsideSelect = (event) => {
      if (selectLanguageRef.current && !selectLanguageRef.current.contains(event.target)) {
        setDropdownOut(false);
      }
    };
    // add event listeners for mouse clicking 
    window.addEventListener('mousedown', handleClickOutsideSelect, true);
    return () => {
      window.removeEventListener('mousedown', handleClickOutsideSelect, true);
    };
  }, []);


  // render translate elements
  return (
    <div className='translate-button-container'>
      {/* translate icon button for toggling menu */}
    <div className="translate-button" ref={menuRef} style={{ position: 'relative', display:'inline-block'}}>
      <button className={`image-button ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <img
            className="translate-icon"
            src={'/Media/Translate.png'}
            alt="Translate"
            data-testid="translate"
          />
      </button>
  
      {/* translate menu shown when toggled */}
      {isMenuOpen && (
        <div className="translate-menu">
          {/* current input language render, language that recipe was written in */}
          <span className="language-name">{getLanguageName(selectedLanguageIn)}</span>
  
          {/*  arrow icon between languages */}
          <img
            src="/Media/Arrow.png"
            alt="Arrow"
            className="translate-arrow"
          />
  
          {/* output language render that triggers langauge dropdown for selection*/}
          <div className="language-dropdown-container" ref={selectLanguageRef}>
            <span className="select-language" onClick={() => toggleDropdown()}> 
              {getLanguageName(selectedLanguageOut) ||
                'Select Language'}
                {/* dropdown arrow icon - rotating arrow on open and close */}
                <img 
                  src="/Media/arrowDown.png" 
                  alt="Arrow" 
                  className={`dropdown-arrow ${isDropdownOut ? 'open' : ''}`} 
                />
              </span>
            {/* language dropdown with list of supported languages for selecting output language */}
            {isDropdownOut && (
              <div className="Modal-language-dropdown">
                <ul className="language-list">
                  {/* map through all supported languages */}
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