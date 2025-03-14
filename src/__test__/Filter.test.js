import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 

// Component to be tested
import Filter from '../Recipe_Box/Filter';

describe('Filter', () => {
  test('Renders without crashing', () => {
    render(<Filter />);
  });

  // Test case to check if a specific element is present in the component
  test('Renders the Filter image', () => {
    render(<Filter />);
    
    const filter = screen.getByTestId('filter');
    expect(filter).toBeInTheDocument();
    expect(filter).toHaveAttribute('src', '/Media/Filter.png');
  });

  // Test case to check if a specific class is applied
  test('Applies the correct styling', () => {
    render(<Filter className="filter" />);
    
    expect(screen.getByTestId('filter')).toHaveClass('filter');
  });
});