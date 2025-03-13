import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the component to be tested
import RecipeBox from '../Recipe_Box/RecipeBox';

jest.mock('../Recipe_Box/Filter', () => () => <div data-testid="filter"></div>);
jest.mock('../Recipe_Box/Recipes', () => () => <div data-testid="recipe"></div>);

// Describe block to group related tests
describe('RecipeBox', () => {
  // Basic test case to check if the component renders without crashing
  it('renders without crashing', () => {
    render(<RecipeBox />);
  });

  // Test case to check if a specific element is present in the component
  it('renders the correct content', () => {
    render(<RecipeBox />);
    
    expect(screen.getByTestId('recipe-box')).toBeInTheDocument();
  });

  // Test case to check if a specific class is applied
  it('applies the correct class name', () => {
    render(<RecipeBox className="recipe-box" />);
    
    // Example: Check if the component has the correct class
    expect(screen.getByTestId('recipe-box')).toHaveClass('recipe-box');
  });

  test('All Components are loaded', () => {
    render(<RecipeBox />);

    expect(screen.getByTestId('filter')).toBeInTheDocument();
    expect(screen.getByTestId('recipe')).toBeInTheDocument();
  });
});