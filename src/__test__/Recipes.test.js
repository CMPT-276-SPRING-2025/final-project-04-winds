import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import Recipes from '../Recipe_Box/Recipes';

// get the simplified recipe box componenet
jest.mock('../Recipe_Box/IndvRecipe', () => () => <div data-testid="indiviual-box"></div>);

describe('Recipes', () => {
  test('Renders without crashing', () => {
    render(<Recipes />);
  });

  test('Renders the scrollbox', () => {
    render(<Recipes />);
    
    expect(screen.getByTestId('scrollbox')).toBeInTheDocument();
  });

  test('Applies the correct styling to scrollbox', () => {
    render(<Recipes className="scrollbox" />);
    
    expect(screen.getByTestId('scrollbox')).toHaveClass('scrollbox');
  });
/*
  test('At least one IndiviualBox component is loaded', () => {
    render(<Recipes />);
  
    expect(screen.queryAllByTestId('indiviual-box').length).toBeGreaterThanOrEqual(1);
  });*/
});