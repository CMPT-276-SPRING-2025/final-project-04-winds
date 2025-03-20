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

  test('Doesn\'t give an error when onclick isn\'t provided', () => {
    render(<IndiviualBox recipe={mockRecipe}/>)    
    expect(() => fireEvent.click(screen.getByTestId('box'))).not.toThrow()
  });

  test('Handles missing recipe titles gracefully', () => {
    const recipeWithoutTitle = { ...mockRecipe, title: undefined}
    render(<IndiviualBox recipe={recipeWithoutTitle} onClick={mockOnClick} />)
    const title = screen.getByTestId('title')
    expect(title.textContent).toBe('')
  });

  test('Handles missing recipe images gracefully', () => {
    const recipeWithoutImage = { ...mockRecipe, image: undefined}
    render(<IndiviualBox recipe={recipeWithoutImage} onClick={mockOnClick} />)
    const image = screen.getByTestId('image')
    expect(image).toHaveAttribute('src', '')
  });

  test('Image has a valid alt text', () => {
    render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />)
    const image = screen.getByTestId('image')
    expect(image).toHaveAttribute('alt', mockRecipe.title)
  });

  test('Box is clickable', () => {
    render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />)
    const boxElement = screen.getByTestId('box');
    expect(boxElement).toBeEnabled()
  });

  test('Box is has a role', () => {
    render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />)
    const boxElement = screen.getByTestId('box');
    expect(boxElement).toBeEnabled()
    expect(boxElement).toHaveAttribute('role', 'button')
  });
});