import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import InputBox from '../Ingredient_Box/InputBox';

describe('InputBox', () => {
  test('Renders without crashing', () => {
    render(<InputBox />);
  });

  test('Renders the white box', () => {
    render(<InputBox />);
    
    expect(screen.getByTestId('white-box')).toBeInTheDocument();
  });

  test('Applies the correct styling to the white box', () => {
    render(<InputBox className="white-box" />);
    
    expect(screen.getByTestId('white-box')).toHaveClass('white-box');
  });
});