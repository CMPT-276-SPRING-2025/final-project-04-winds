
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import IngredientsBox from '../Ingredient_Box/IngredientsBox';

// Simplified version of input box
jest.mock('../Ingredient_Box/InputBox', () => () => <div data-testid="input-box"></div>);


describe('IngredientsBox', () => {
  test('Renders without crashing', () => {
    render(<IngredientsBox />);
  });

  test('Renders the green box', () => {
    render(<IngredientsBox />);
    
    expect(screen.getByTestId('green-box')).toBeInTheDocument();
  });

  test('Applies the correct styling to the green box', () => {
    render(<IngredientsBox className="green-box" />);
    
    expect(screen.getByTestId('green-box')).toHaveClass('green-box');
  });

  test('All InputBoxes are loaded', () => {
    render(<IngredientsBox/>)
    expect(screen.getByTestId('input-box')).toBeInTheDocument();
  });
  
});