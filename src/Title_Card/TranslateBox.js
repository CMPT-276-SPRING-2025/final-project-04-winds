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

  // state refs for keyboard navigation
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // index of highlighted language in dropdown
  const languageRefs = useRef([]); // refs for each language in dropdown
  
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

  // Reset highlighted index when the dropdown is opened
  useEffect(() => {
    if (isDropdownOut) {
      setHighlightedIndex(0);
    }
  }, [isDropdownOut]);

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
    <div className="translate-button" ref={menuRef}>
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
            <span 
              className="select-language" 
              onClick={() => toggleDropdown()}
              tabIndex="0"
              onKeyDown={(e) => {
                if (!isDropdownOut) return;
            
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
                  if (highlightedIndex >= 0) {
                    handleLanguageSelect(Languages[highlightedIndex].code, 'out');
                  }
                } else if (e.key === 'Escape') {
                  setDropdownOut(false);
                }
              }}
            > 
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
                  {Languages.map((lang, index) => (
                    <li
                      key={`${lang.code}-${index}`}
                      ref={(el) => (languageRefs.current[index] = el)}
                      className={`language-item ${
                        selectedLanguageOut === lang.code ? 'selected' : ''
                      } ${highlightedIndex === index ? 'highlighted' : ''}`}
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
  );
};

export default TranslateBox;