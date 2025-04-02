import React, { useState, useRef, useEffect} from 'react';
import Languages from '../data/Languages';
import './TranslateTTSBox.css'

const TranslateBox = ({selectedLanguageOut, setSelectedLanguageOut, selectedLanguageIn, setSelectedLanguageIn}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDropdownOut, setDropdownOut] = useState(false);
 
  const menuRef = useRef(null);
  
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
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    // remove listener 
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // render
  return (
    <div className='translate-container' ref={menuRef}>
      <div className='translate-button'>
        {/* translate icon button */}
        <button className={`image-button ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <img
              src={'/Media/Translate.png'}
              alt="Translate"
              className='image-button'
              data-testid='translate'
            />
          </button>

      </div>
        
      {/* translate menu */}
      {isMenuOpen && (
        <div className='translate-menu'> 
          {/* left language */}
          <span className="language-name">{getLanguageName(selectedLanguageIn)}</span>
              

          {/* middle arrow */}
          <img
              src="/Media/Arrow.png"
              alt="Arrow"
              className='select-language translate-arrow'
          /> 
          

          {/* right language */}
          <div className='language-dropdown-container'>
            <span className="select-language"  onClick={() => toggleDropdown()}>
                {getLanguageName(selectedLanguageOut) ? 
                Languages.find(lang => lang.code === selectedLanguageOut)?.name : 
                'Select Language'}

                {isDropdownOut ? 
                  <img
                      src="/Media/arrowUp.png"
                      alt="Arrow"
                      className='dropdown-arrow'
                  />  : 
                  <img
                      src="/Media/arrowDown.png"
                      alt="Arrow"
                      className='dropdown-arrow'
                  />  }
            </span>

            {isDropdownOut && (
              <div className="language-dropdown">
                <ul className="language-list" >
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
  );
};

export default TranslateBox;