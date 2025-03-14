import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import IndvRecipe from '../Recipe_Box/IndvRecipe';

describe('IndvRecipe', () => {
  test('Renders without crashing', () => {
    render(<IndvRecipe />);
  });

  test('Applies the correct styling to title', () => {
    render(<IndvRecipe className="title" />);
    
    expect(screen.getByTestId('title')).toHaveClass('title');
  });

  test('applies the correct styling to box', () => {
    render(<IndvRecipe className="box" />);
    
    expect(screen.getByTestId('box')).toHaveClass('box');
  });
});