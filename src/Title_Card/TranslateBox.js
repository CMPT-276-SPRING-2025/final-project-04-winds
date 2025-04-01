import React, { useState, useRef, useEffect} from 'react';
import Languages from '../data/Languages';
import './TranslateTTSBox.css'

const TranslateBox = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDropdownIn, setDropdownIn] = useState(false);
  const [isDropdownOut, setDropdownOut] = useState(false);
  const [selectedLanguageIn, setSelectedLanguageIn] = useState('en');
  const [selectedLanguageOut, setSelectedLanguageOut] = useState('en');
  const menuRef = useRef(null);
  

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  }

  const toggleDropdown = (type) => {
    if (type === 'in'){
      setDropdownIn(!isDropdownIn);
      setDropdownOut(false); // close other dropdown
    } else {
      setDropdownOut(!isDropdownOut);
      setDropdownIn(false);
    }
  }

  const getLanguageName = (code) => {
    const language = Languages.find(language => language.code === code);
    return language ? language.name : 'Unknown';
  }

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
          <div className='language-dropdown-container'>
            <span className="select-language" onClick={() => toggleDropdown('in')}>
                {getLanguageName(selectedLanguageIn) ? 
                Languages.find(lang => lang.code === selectedLanguageIn)?.name : 
                'Select Language'}

                {isDropdownIn ? 
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

            {isDropdownIn && (
              <div className="language-dropdown">
                <ul className="language-list" >
                  {Languages.map((lang) => (
                    <li
                      key={lang.code}
                      className={`language-item ${
                        selectedLanguageIn === lang.code ? 'selected' : ''
                      }`}
                      onClick={() => handleLanguageSelect(lang.code, 'in')}
                    >
                      <span className="language-name">{lang.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            
            )}
          </div>

          {/* middle arrow */}
          <img
              src="/Media/Arrow.png"
              alt="Arrow"
              className='select-language translate-arrow'
          /> 
          

          {/* right language */}
          <div className='language-dropdown-container'>
            <span className="select-language"  onClick={() => toggleDropdown('out')}>
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