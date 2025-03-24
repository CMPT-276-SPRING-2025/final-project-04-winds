import React, {useState} from 'react';
import './Filter.css'

const Filter = ({isToggled, filterToggle, filterOptionToggle, selectedFilters}) => {
  const [showExcludePopup, setShowExcludePopup] = useState(false);
  
  const dietOptions = ['Vegan', 'Vegetarian', 'Gluten Free'];

  return (
    // button toggle
    <div className='filter-container' onClick={filterToggle}>
      <img
          src={isToggled ? '/Media/b-Filter.png' : '/Media/Filter.png'}
          alt="Filter"
          className='filter'
          data-testid="filter"
      />

    {/* toggle filter option buttons */}
      {isToggled ? (
        <div className='filter-options'> 
        {/* loop over each element in diet options to check if its selected & update buttons*/}
          {dietOptions.map((option) => (
            <button 
              key = {option}
              className={`filter-button ${selectedFilters.includes(option) ? 'selected': ''}`} 
              onClick={(event) => filterOptionToggle(option, event)}
            > {option} </button>
          ))}
            
            <button className="filter-exclude">Ingredients to exclude:</button>
        </div>
      ):null}

    </div>
  );
};

export default Filter;