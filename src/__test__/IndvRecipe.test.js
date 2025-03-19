import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import IndiviualBox from '../Recipe_Box/IndvRecipe';

describe('IndiviualBox', () => {
  const mockRecipe = {
    title: 'Test Recipe',
    image: 'https://example.com/test-image.jpg',
  };

  const mockOnClick = jest.fn();

  test('Renders without crashing', () => {
    render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />);
  });

  test('Renders the recipe title correctly', () => {
    render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />);
    
    expect(screen.getByTestId('title')).toHaveTextContent(mockRecipe.title);
  });

  test('Renders the recipe image correctly', () => {
    render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />);
    
    const imageElement = screen.getByTestId('image');
    expect(imageElement).toHaveAttribute('src', mockRecipe.image);
    expect(imageElement).toHaveAttribute('alt', mockRecipe.title);
  });

  test('Applies the correct styling to the title', () => {
    render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />);
    
    expect(screen.getByTestId('title')).toHaveClass('recipe-title');
  });

  test('Applies the correct styling to the box', () => {
    render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />);
    
    expect(screen.getByTestId('box')).toHaveClass('box');
  });

  test('Calls onClick handler when the box is clicked', () => {
    render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByTestId('box'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});