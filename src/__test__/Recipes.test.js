import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the component to be tested
import Recipes from '../Recipe_Box/Recipes';

// Mock the IndiviualBox component to isolate Recipes component testing
jest.mock('../Recipe_Box/IndvRecipe', () => ({ recipe, onClick }) => (
  <div data-testid="indiviual-box" onClick={onClick}>
    {recipe.name}
  </div>
));

describe('Recipes Component', () => {
  // Sample recipe data for testing
  const mockRecipes = [
    { id: 1, name: 'Recipe 1' },
    { id: 2, name: 'Recipe 2' },
  ];

  // Mock function for recipe click handler
  const mockOnRecipeClick = jest.fn();

  // Basic rendering tests
  describe('Basic Rendering', () => {
    test('Renders without crashing', () => {
      // Verify component mounts without errors
      render(<Recipes />);
    });

    test('Renders the scrollbox container', () => {
      render(<Recipes />);    
      // Verify scrollbox element exists
      expect(screen.getByTestId('scrollbox')).toBeInTheDocument();
    });

    test('Applies the correct styling to scrollbox', () => {
      // Test className prop is properly applied
      render(<Recipes className="scrollbox" />);    
      expect(screen.getByTestId('scrollbox')).toHaveClass('scrollbox');
    });
  });

  // Recipe display tests
  describe('Recipe Display', () => {
    test('Renders IndiviualBox for each recipe when recipes are provided', () => {
      render(<Recipes recipes={mockRecipes} onRecipeClick={mockOnRecipeClick}/>);  
      
      // Get all rendered recipe boxes
      const indiviualBoxes = screen.getAllByTestId('indiviual-box');
      
      // Verify correct number of boxes rendered
      expect(indiviualBoxes.length).toBe(mockRecipes.length);
      
      // Verify each box displays correct recipe name
      indiviualBoxes.forEach((box, index) => {
        expect(box).toHaveTextContent(mockRecipes[index].name);
      });
    });

    test('Calls onRecipeClick handler when a recipe box is clicked', () => {
      render(<Recipes recipes={mockRecipes} onRecipeClick={mockOnRecipeClick}/>);
      
      // Find and click the first recipe box
      const firstRecipeBox = screen.getByText(mockRecipes[0].name);
      firstRecipeBox.click();
      
      // Verify handler was called with correct recipe
      expect(mockOnRecipeClick).toHaveBeenCalledWith(mockRecipes[0]);
    });
  });

  // Empty state test
  describe('Empty State', () => {
    test('Displays a message when no recipes are found', () => {
      render(<Recipes recipes={[]} onRecipeClick={mockOnRecipeClick}/>);

      // Verify empty state message appears
      const noRecipeMessage = screen.getByText(
        /No recipes found. Enter some ingredients then try searching!/i
      );
      expect(noRecipeMessage).toBeInTheDocument();
    });
  });
});