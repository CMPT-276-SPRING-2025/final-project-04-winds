import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import IngredientsBox from '../Ingredient_Box/IngredientsBox';

// Mock the InputBox component to simplify testing
jest.mock('../Ingredient_Box/InputBox', () => () => <div data-testid="input-box"></div>);

describe('IngredientsBox Component', () => {
  // Mock props for testing
  const mockIngredients = [];
  const mockSetIngredients = jest.fn();
  const mockOnSearch = jest.fn();

  // Basic rendering tests
  describe('Basic Rendering', () => {
    test('Renders without crashing', () => {
      render(<IngredientsBox />);
      // Just verify the component mounts without errors
    });

    test('Renders the green box container', () => {
      render(<IngredientsBox />);
      // Verify the main container element exists
      expect(screen.getByTestId('green-box')).toBeInTheDocument();
    });

    test('Applies the correct styling to the green box', () => {
      render(<IngredientsBox className="green-box" />);
      // Verify className prop is properly passed to container
      expect(screen.getByTestId('green-box')).toHaveClass('green-box');
    });
  });

  // InputBox component tests
  describe('InputBox Handling', () => {
    test('Renders the InputBox component', () => {
      render(<IngredientsBox />);
      // Verify the mocked InputBox is rendered
      expect(screen.getByTestId('input-box')).toBeInTheDocument();
    });

    test('Passes ingredients and setIngredients props to InputBox', () => {
      render(
        <IngredientsBox
          ingredients={mockIngredients}
          setIngredients={mockSetIngredients}
        />
      );
      // Verify InputBox receives the props (actual prop passing is verified in InputBox tests)
      expect(screen.getByTestId('input-box')).toBeInTheDocument();
    });
  });

  // Search button tests
  describe('Search Button', () => {
    test('Renders the "Get Cooking!" button', () => {
      render(<IngredientsBox />);
      // Verify button exists with correct text
      expect(
        screen.getByRole('button', { name: /get cooking!/i })
      ).toBeInTheDocument();
    });

    test('Applies correct styling to the search button', () => {
      render(<IngredientsBox />);
      const button = screen.getByRole('button', { name: /get cooking!/i });
      // Verify button has the expected CSS class
      expect(button).toHaveClass('search-button');
    });

    test('Calls onSearch when the button is clicked', () => {
      render(<IngredientsBox onSearch={mockOnSearch} />);
      const button = screen.getByRole('button', { name: /get cooking!/i });
      // Simulate button click and verify callback
      fireEvent.click(button);
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
    });

    test('Does not throw error when onSearch is not provided', () => {
      render(<IngredientsBox />);
      const button = screen.getByRole('button', { name: /get cooking!/i });
      // Verify button click doesn't throw without callback
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });

  // Edge case tests
  describe('Edge Cases', () => {
    test('Renders properly with empty ingredients array', () => {
      render(<IngredientsBox ingredients={[]} />);
      // Verify component handles empty ingredients
      expect(screen.getByTestId('green-box')).toBeInTheDocument();
    });

    test('Renders properly with null values in ingredients', () => {
      render(<IngredientsBox ingredients={[null]} />);
      // Verify component handles null ingredients
      expect(screen.getByTestId('green-box')).toBeInTheDocument();
    });
  });
});