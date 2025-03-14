import React from 'react';
import './Filter.css'

const Filter = () => {
  return (
    <img
        src={'/Media/Filter.png'}
        alt="Filter"
        className='filter'
        data-testid="filter"
      />
  );
};

export default Filter;