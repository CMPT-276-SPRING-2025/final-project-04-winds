import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import Recipes from '../Recipe_Box/Recipes';

// Mock the IndiviualBox component
jest.mock('../Recipe_Box/IndvRecipe', () => ({ recipe, onClick }) => (
  <div data-testid="indiviual-box" onClick={onClick}>
    {recipe.name}
  </div>
));

describe('Recipes', () => {
  const mockRecipes = [
    { id: 1, name: 'Recipe 1' },
    { id: 2, name: 'Recipe 2' },
  ];

  const mockOnRecipeClick = jest.fn();

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

  test('Renders IndiviualBox Box when recipies are given', () => {
    render(<Recipes recipes={mockRecipes} onRecipeClick={mockOnRecipeClick}/>);  
    const indiviualBoxes = screen.getAllByTestId('indiviual-box');
    expect(indiviualBoxes.length).toBe(mockRecipes.length)
    indiviualBoxes.forEach((box, index) => {
      expect(box).toHaveTextContent(mockRecipes[index].name)
    })
  });

  test('Calls onRecipeClick when an IndiviualBox is clicked', () => {
    render(<Recipes recipes={mockRecipes} onRecipeClick={mockOnRecipeClick}/>);
    const firstRecipeBox = screen.getByText(mockRecipes[0].name);
    firstRecipeBox.click()
    expect(mockOnRecipeClick).toHaveBeenCalledWith(mockRecipes[0])
  });

  test('Displays a message when no recipes are found', () => {
    render(<Recipes recipes={[]} onRecipeClick={mockOnRecipeClick}/>);

    const noRecipeMessage = screen.getByText(/No recipes found. Enter some ingrendients then try searching!/i)
    expect(noRecipeMessage).toBeInTheDocument()
  });
});