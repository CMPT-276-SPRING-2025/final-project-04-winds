/* eslint-disable no-unused-vars */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import RecipeBox from '../Recipe_Box/RecipeBox';

// Mocking the Filter and Recipe components to isolate testing for RecipeBox
jest.mock('../Recipe_Box/Filter', () => () => <div data-testid="filter"></div>);
jest.mock('../Recipe_Box/Recipes', () => () => <div data-testid="recipe"></div>);

// Mocking the RecipeModal component with test attributes for inspection
jest.mock('../Recipe_Box/RecipeModal', () => ({ recipe, onClose }) => (
  <div data-testid="recipe-modal" data-recipe={JSON.stringify(recipe)} data-on-close={onClose ? 'provided' : 'not-provided'}>
    Mock RecipeModal
  </div>
));

describe('RecipeBox', () => {
  // Mock data and functions used across multiple tests
  const mockRecipes = [{ id: 1, title: 'Test Recipe', image: 'https://example.com/test-image.jpg'}]
  const mockSelectedRecipe = { id: 1, title: 'Test Recipe', image: 'https://example.com/test-image.jpg'}
  const mockOnRecipeClick = jest.fn()
  const mockCloseModal = jest.fn()

  // Test: Component renders without crashing
  test('Renders without crashing', () => {
    render(<RecipeBox />);
  });

  // Test: Recipe box wrapper is rendered
  test('Renders the recipe box wrap', () => {
    render(<RecipeBox />);    
    expect(screen.getByTestId('recipe-box')).toBeInTheDocument();
  });

  // Test: Correct className is applied to wrapper
  test('Applies the correct styling to the wrap', () => {
    render(<RecipeBox className="recipe-box" />);    
    expect(screen.getByTestId('recipe-box')).toHaveClass('recipe-box');
  });

  // Test: Filter and Recipe components are present
  test('Filter and Recipe Components are loaded', () => {
    render(<RecipeBox />);
    expect(screen.getByTestId('filter')).toBeInTheDocument();
    expect(screen.getByTestId('recipe')).toBeInTheDocument();
  });

  // Test: Recipes and onRecipeClick props are passed correctly
  test('Passes recipes and onRecipeClick props to recipe component', () => {
    render(<RecipeBox recipes={mockRecipes} onRecipeClick={mockOnRecipeClick}/>);    
    expect(screen.getByTestId('recipe')).toBeInTheDocument();
  });

  // Test: Recipe modal is rendered when selectedRecipe is provided
  test('Renders Recipe Modal when selected recipe is given', () => {
    render(<RecipeBox selectedRecipe={mockSelectedRecipe} closeModal={mockCloseModal}/>);    
    expect(screen.getByTestId('recipe-modal')).toBeInTheDocument();  
  });

  // Test: Recipe modal is not rendered when selectedRecipe is not provided
  test('Doesn\'t load Recipe Modal when selected recipe is not provided', () => {
    render(<RecipeBox/>);    
    expect(screen.queryByTestId('recipe-modal')).not.toBeInTheDocument();  
  });

  // Test: selectedRecipe and closeModal props are correctly passed to RecipeModal
  test('Passes selectedRecipe and closeModal props to RecipeModal', () => {
    render(<RecipeBox selectedRecipe={mockSelectedRecipe} closeModal={mockCloseModal}/>);    
    const recipeModal = screen.getByTestId('recipe-modal');
    expect(recipeModal).toBeInTheDocument();
    expect(recipeModal).toHaveAttribute('data-recipe', JSON.stringify(mockSelectedRecipe));
    expect(recipeModal).toHaveAttribute('data-on-close', 'provided');
  });

  // Test: Component handles empty recipes array without crashing
  test('Handles empty recipe array', () => {
    render(<RecipeBox recipes={[]}/>);    
    expect(screen.getByTestId('recipe')).toBeInTheDocument();
  });

  // Test: RecipeModal not rendered when selectedRecipe is null
  test('Does not render RecipeModal when selectedRecipe is null', () => {
    render(<RecipeBox selectedRecipe={null} />);
    expect(screen.queryByTestId('recipe-modal')).not.toBeInTheDocument();
  });

  // Test: RecipeModal not rendered when selectedRecipe is undefined
  test('Does not render RecipeModal when selectedRecipe is undefined', () =>{
    render(<RecipeBox selectedRecipe={undefined} />);
    expect(screen.queryByTestId('recipe-modal')).not.toBeInTheDocument();
  });

  // Test: Component handles null recipes prop gracefully
  test('Handles null recipes prop gracefully', () => {
    render(<RecipeBox recipes={null} />);
    expect(screen.getByTestId('recipe')).toBeInTheDocument();
  });

  // Test: Component handles undefined recipes prop gracefully
  test('Handles undefined recipes prop gracefully', () => {
    render(<RecipeBox recipes={undefined} />);
    expect(screen.getByTestId('recipe')).toBeInTheDocument();
  });

  // Test: Component handles null onRecipeClick prop gracefully
  test('Handles null onRecipeClick prop gracefully', () => {
    render(<RecipeBox onRecipeClick={null} />);
    expect(screen.getByTestId('recipe')).toBeInTheDocument();
  });

  // Test: Component handles undefined onRecipeClick prop gracefully
  test('Handles undefined onRecipeClick prop gracefully', () => {
    render(<RecipeBox onRecipeClick={undefined} />);
    expect(screen.getByTestId('recipe')).toBeInTheDocument();
  });

  // Test: Component still renders RecipeModal even if closeModal is null
  test('Handles null closeModal prop gracefully', () => {
    render(<RecipeBox selectedRecipe={mockSelectedRecipe} closeModal={null} />);
    expect(screen.getByTestId('recipe-modal')).toBeInTheDocument();
  });

  // Test: Component still renders RecipeModal even if closeModal is undefined
  test('Handles undefined closeModal prop gracefully', () => {
    render(<RecipeBox selectedRecipe={mockSelectedRecipe} closeModal={undefined} />);
    expect(screen.getByTestId('recipe-modal')).toBeInTheDocument();
  });

  // Test: Component handles selectedRecipe with missing fields
  test('Handles incomplete selectedRecipe prop gracefully', () => {
    const incompleteRecipe = { id: 1, title: 'Test Recipe' };
    render(<RecipeBox selectedRecipe={incompleteRecipe} closeModal={mockCloseModal} />);
    expect(screen.getByTestId('recipe-modal')).toBeInTheDocument();
  });

  // Test: Component handles invalid recipe objects in array
  test('Handles invalid recipes prop gracefully', () => {
    const invalidRecipes = [{ id: 1, title: null }, { id: 2, image: undefined }];
    render(<RecipeBox recipes={invalidRecipes} />);
    expect(screen.getByTestId('recipe')).toBeInTheDocument();
  });
});
