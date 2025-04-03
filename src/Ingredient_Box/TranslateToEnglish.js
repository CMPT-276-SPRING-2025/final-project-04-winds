import React, { useState } from 'react';
import Languages from '../data/LanguagesforQ';
import './TranslateToEnglish.css'

const TranslateToEnglish = ({ setSelectedLanguageIn }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('auto'); // Default to 'auto'

  const getLanguageName = (code) => {
    if (code === 'auto') {
      return 'Auto-detect'; // Display Auto-detect for 'auto'
    }

    const language = Languages.find((lang) => lang.code === code);
    return language ? language.name : 'Unknown';
  };

  const handleLanguageSelect = (languageCode) => {
    setSelectedLanguage(languageCode);
    setSelectedLanguageIn(languageCode); // Pass to parent component
    setIsDropdownOpen(false);
  };

  return (
    <div className="translate-container">
      <span className="select-language" data-testid="language-selector" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        <strong>Input Language:</strong> 
        <span className="language-name">{getLanguageName(selectedLanguage)}</span>
        <img src="/Media/arrowDown.png" alt="Arrow" className="dropdown-arrow" />
      </span>

      {isDropdownOpen && (
        <div className="language-dropdown">
          <ul className="language-list" >
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
