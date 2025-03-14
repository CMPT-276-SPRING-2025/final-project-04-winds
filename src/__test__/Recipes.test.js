import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the component to be tested
import Recipes from '../Recipe_Box/Recipes';

jest.mock('../Recipe_Box/IndvRecipe', () => () => <div data-testid="indiviual-box"></div>);

// Describe block to group related tests
describe('Recipes', () => {
  // Basic test case to check if the component renders without crashing
  it('renders without crashing', () => {
    render(<Recipes />);
  });

  // Test case to check if a specific element is present in the component
  it('renders the correct content', () => {
    render(<Recipes />);
    
    // Example: Check if a specific text is present in the component
    expect(screen.getByTestId('scrollbox')).toBeInTheDocument();
  });

  // Test case to check if a specific class is applied
  it('applies the correct class name', () => {
    render(<Recipes className="scrollbox" />);
    
    // Example: Check if the component has the correct class
    expect(screen.getByTestId('scrollbox')).toHaveClass('scrollbox');
  });

  test('At least one IndiviualBox component is loaded', () => {
    render(<Recipes />);
  
    // Check if at least one element with the test ID exists
    expect(screen.queryAllByTestId('indiviual-box').length).toBeGreaterThanOrEqual(1);
  });
});