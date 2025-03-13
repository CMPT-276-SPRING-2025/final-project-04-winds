// Import necessary dependencies
import React from 'react';
import { render, screen } from '@testing-library/react'; // Import fireEvent
import '@testing-library/jest-dom'; // Updated import for additional matchers like .toBeInTheDocument()

// Import the component to be tested
import IngredientsBox from '../Ingredient_Box/IngredientsBox';

jest.mock('../Ingredient_Box/InputBox', () => () => <div data-testid="input-box"></div>);

// Describe block to group related tests
describe('IngredientsBox', () => {
  // Basic test case to check if the component renders without crashing
  it('renders without crashing', () => {
    render(<IngredientsBox />);
  });

  // Test case to check if a specific element is present in the component
  it('renders the correct content', () => {
    render(<IngredientsBox />);
    
    // Example: Check if a specific text is present in the component
    expect(screen.getByTestId('green-box')).toBeInTheDocument();
  });

  // Test case to check if a specific class is applied
  it('applies the correct class name', () => {
    render(<IngredientsBox className="green-box" />);
    
    // Example: Check if the component has the correct class
    expect(screen.getByTestId('green-box')).toHaveClass('green-box');
  });

  it('has inputbox inside', () => {
    expect(screen.getByTestId('input-box')).toBeInTheDocument();
  });
  
});