import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import IndiviualBox from '../Recipe_Box/IndvRecipe';

describe('IndvRecipe Component', () => {
  // Mock recipe data for testing
  const mockRecipe = {  
    title: 'Test Recipe',
    image: 'https://example.com/test-image.jpg',
  };

  // Mock click handler
  const mockOnClick = jest.fn();

  // Basic rendering tests
  describe('Basic Rendering', () => {
    test('Renders without crashing', () => {
      render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />);
      // Just verify the component mounts without errors
    });

    test('Renders the recipe title correctly', () => {
      render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />);
      
      // Verify title is displayed and matches recipe data
      expect(screen.getByTestId('title')).toHaveTextContent(mockRecipe.title);
    });

    test('Renders the recipe image correctly', () => {
      render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />);
      
      // Verify image src and alt text are set correctly
      const imageElement = screen.getByTestId('image');
      expect(imageElement).toHaveAttribute('src', mockRecipe.image);
      expect(imageElement).toHaveAttribute('alt', mockRecipe.title);
    });
  });

  // Styling tests
  describe('Styling', () => {
    test('Applies the correct styling to the title', () => {
      render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />);
      
      // Verify title has correct CSS class
      expect(screen.getByTestId('title')).toHaveClass('recipe-title');
    });

    test('Applies the correct styling to the box', () => {
      render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />);
      
      // Verify container box has correct CSS class
      expect(screen.getByTestId('box')).toHaveClass('box');
    });
  });

  // Interaction tests
  describe('User Interaction', () => {
    test('Calls onClick handler when the box is clicked', () => {
      render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />);
      
      // Simulate click and verify handler is called
      fireEvent.click(screen.getByTestId('box'));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    test('Does not throw error when onClick is not provided', () => {
      render(<IndiviualBox recipe={mockRecipe}/>);
      
      // Verify click doesn't throw without handler
      expect(() => fireEvent.click(screen.getByTestId('box'))).not.toThrow();
    });

    test('Box is clickable and has proper role', () => {
      render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />);
      
      // Verify box is interactive
      const boxElement = screen.getByTestId('box');
      expect(boxElement).toBeEnabled();
      expect(boxElement).toHaveAttribute('type', 'button');
    });
  });

  // Edge case tests
  describe('Edge Cases', () => {
    test('Handles missing recipe titles gracefully', () => {
      const recipeWithoutTitle = { ...mockRecipe, title: undefined};
      render(<IndiviualBox recipe={recipeWithoutTitle} onClick={mockOnClick} />);
      
      // Verify empty title doesn't break component
      const title = screen.getByTestId('title');
      expect(title.textContent).toBe('');
    });

    test('Handles missing recipe images gracefully', () => {
      const recipeWithoutImage = { ...mockRecipe, image: undefined};
      render(<IndiviualBox recipe={recipeWithoutImage} onClick={mockOnClick} />);
      
      // Verify fallback image is used when no image provided
      const image = screen.getByTestId('image');
      expect(image).toHaveAttribute('src', '/Media/Logo.gif');
    });

    test('Image always has valid alt text', () => {
      render(<IndiviualBox recipe={mockRecipe} onClick={mockOnClick} />);
      
      // Verify accessibility - image has proper alt text
      const image = screen.getByTestId('image');
      expect(image).toHaveAttribute('alt', mockRecipe.title || '');
    });
  });
});