import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the component to be tested
import IndvRecipe from '../Recipe_Box/IndvRecipe';

// Describe block to group related tests
describe('IndvRecipe', () => {
  // Basic test case to check if the component renders without crashing
  it('renders without crashing', () => {
    render(<IndvRecipe />);
  });

  // Test case to check if a specific class is applied
  it('applies the correct class name to title', () => {
    render(<IndvRecipe className="title" />);
    
    // Example: Check if the component has the correct class
    expect(screen.getByTestId('title')).toHaveClass('title');
  });

  // Test case to check if a specific class is applied
  it('applies the correct class name to box', () => {
    render(<IndvRecipe className="box" />);
    
    // Example: Check if the component has the correct class
    expect(screen.getByTestId('box')).toHaveClass('box');
  });
});