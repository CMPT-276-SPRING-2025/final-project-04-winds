import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the component to be tested
import InputBox from '../Ingredient_Box/InputBox';

// Describe block to group related tests
describe('InputBox', () => {
  // Basic test case to check if the component renders without crashing
  it('renders without crashing', () => {
    render(<InputBox />);
  });

  // Test case to check if a specific element is present in the component
  it('renders the correct content', () => {
    render(<InputBox />);
    
    // Example: Check if a specific text is present in the component
    expect(screen.getByTestId('white-box')).toBeInTheDocument();
  });

  // Test case to check if a specific class is applied
  it('applies the correct class name', () => {
    render(<InputBox className="white-box" />);
    
    // Example: Check if the component has the correct class
    expect(screen.getByTestId('white-box')).toHaveClass('white-box');
  });
});