import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import RecipeBox from '../Recipe_Box/RecipeBox';

// grab the filter and recipe icons
jest.mock('../Recipe_Box/Filter', () => () => <div data-testid="filter"></div>);
jest.mock('../Recipe_Box/Recipes', () => () => <div data-testid="recipe"></div>);

describe('RecipeBox', () => {
  test('Renders without crashing', () => {
    render(<RecipeBox />);
  });

  test('Renders the recipe box wrap', () => {
    render(<RecipeBox />);
    
    expect(screen.getByTestId('recipe-box')).toBeInTheDocument();
  });

  test('Applies the correct styling to the wrap', () => {
    render(<RecipeBox className="recipe-box" />);
    
    expect(screen.getByTestId('recipe-box')).toHaveClass('recipe-box');
  });

  test('Filter and Recipe Components are loaded', () => {
    render(<RecipeBox />);

    expect(screen.getByTestId('filter')).toBeInTheDocument();
    expect(screen.getByTestId('recipe')).toBeInTheDocument();
  });
});