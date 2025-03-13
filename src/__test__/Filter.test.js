import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 

// Component to be tested
import Filter from '../Recipe_Box/Filter';

// Describe block to group related tests
describe('Filter', () => {
  // Basic test case to check if the component renders without crashing
  it('renders without crashing', () => {
    render(<Filter />);
  });

  // Test case to check if a specific element is present in the component
  it('renders the correct content', () => {
    render(<Filter />);
    
    expect(screen.getByTestId('filter')).toBeInTheDocument();
  });

  // Test case to check if a specific class is applied
  it('applies the correct class name', () => {
    render(<Filter className="filter" />);
    
    expect(screen.getByTestId('filter')).toHaveClass('filter');
  });
});