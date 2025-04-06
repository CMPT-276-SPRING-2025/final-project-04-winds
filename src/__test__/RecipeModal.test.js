/* eslint-disable testing-library/no-wait-for-multiple-assertions */
/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-unnecessary-act */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import RecipeModal from '../Recipe_Box/RecipeModal';

// Mock error modal functionality
const mockShowErrorModal = jest.fn();
jest.mock('../ErrorModal', () => ({
  useErrorModal: () => ({
    showErrorModal: mockShowErrorModal, // Mock function
  }),
}));

// Mock recipe data for testing
const mockRecipe = {
  id: 1,
  title: 'Test Recipe',
  image: 'test-image.jpg',
  readyInMinutes: 30,
  usedIngredients: [{ name: 'Flour' }, { name: 'Eggs' }],
  missedIngredients: [{ name: 'Sugar' }, { name: 'Milk' }]
};

// Mock detailed recipe information
const mockRecipeInfo = {
  readyInMinutes: 45,
  nutrition: {
    nutrients: [
      { name: 'Calories', amount: 250 },
      { name: 'Protein', amount: 10 }
    ]
  },
  instructions: '<p>Step 1: Mix ingredients.</p>',
  analyzedInstructions: [
    {
      steps: [
        { number: 1, step: 'Mix dry ingredients' },
        { number: 2, step: 'Add wet ingredients' }
      ]
    }
  ]
};

// Variants of mock recipes for edge case testing
const mockRecipeWithoutImage = {
  ...mockRecipe,
  image: undefined
};

const mockRecipeWithoutTime = {
  ...mockRecipe,
  readyInMinutes: undefined
};

const mockRecipeWithoutIngredients = {
  ...mockRecipe,
  usedIngredients: [],
  missedIngredients: []
};

const mockRecipeWithoutNutrition = {
  ...mockRecipeInfo,
  nutrition: undefined
};

describe('RecipeModal Component', () => {
  // Setup and teardown
  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = false;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Basic rendering tests
  describe('Basic Rendering', () => {
    test('renders modal with basic recipe details', () => {
      render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);

      // Verify all basic recipe information is displayed
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
      expect(screen.getByAltText('Test Recipe')).toHaveAttribute('src', 'test-image.jpg');
      expect(screen.getByText('Ingredients:')).toBeInTheDocument();
      expect(screen.getByText('Flour')).toBeInTheDocument();
      expect(screen.getByText('Sugar')).toBeInTheDocument();
      expect(screen.getByText('Eggs')).toBeInTheDocument();
      expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    test('shows fallback image when recipe image fails to load', () => {
      render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);
      
      const image = screen.getByAltText('Test Recipe');
      // Simulate image loading error
      fireEvent.error(image);
      // Verify fallback image is used
      expect(image).toHaveAttribute('src', '/Media/Logo.gif');
    });

    test('uses default image when recipe has no image', () => {
      render(<RecipeModal recipe={mockRecipeWithoutImage} onClose={jest.fn()} />);
      
      const image = screen.getByAltText('Test Recipe');
      // Verify default image is used when no image provided
      expect(image).toHaveAttribute('src', '/Media/Logo.gif');
    });

    test('displays "N/A" when cooking time is not available', () => {
      render(<RecipeModal recipe={mockRecipeWithoutTime} onClose={jest.fn()} />);
      
      // Verify handling of missing cooking time
      expect(screen.getByText('Cooking Time: N/A minutes')).toBeInTheDocument();
    });
  });

  // API interaction tests
  describe('API Interaction', () => {
    test('fetches and displays additional recipe info', async () => {
      // Mock successful API responses
      global.fetch = jest.fn((url) => {
        if (url.includes('analyzedInstructions')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockRecipeInfo.analyzedInstructions)
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRecipeInfo)
        });
      });
    
      render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);
    
      // Verify API was called
      await waitFor(() => expect(fetch).toHaveBeenCalled());
    
      // Test detailed instructions toggle
      fireEvent.click(screen.getByText('Show Detailed Instructions'));
    
      // Verify detailed instructions are displayed
      await waitFor(() => {
        expect(screen.getByText(/Mix dry ingredients/i)).toBeInTheDocument();
      });
    });
    
    test('handles API fetch errors gracefully', async () => {
      // Mock API failure
      global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));

      await act(async () => {
        render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);
      });

      // Verify error modal is shown
      await waitFor(() => expect(mockShowErrorModal).toHaveBeenCalledTimes(1));
      expect(mockShowErrorModal).toHaveBeenCalledWith({
        context: 'Error fetching recipe info',
        message: 'API Error',
      });
    });

    test('shows loading message while fetching recipe info', () => {
      render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);
      
      // Verify loading state is shown
      expect(screen.getByText('Loading instructions...')).toBeInTheDocument();
    });

    test('does not fetch recipe info when recipe has no ID', () => {
      const recipeWithoutId = { ...mockRecipe, id: undefined };
      render(<RecipeModal recipe={recipeWithoutId} onClose={jest.fn()} />);
      
      // Verify no API call is made for recipes without ID
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  // User interaction tests
  describe('User Interaction', () => {
    test('toggles ingredient selection', () => {
      render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);

      const flourIngredient = screen.getByText('Flour');
      const sugarIngredient = screen.getByText('Sugar');

      // Test ingredient selection toggle
      fireEvent.click(flourIngredient);
      expect(flourIngredient.parentElement).toHaveClass('checked');
      expect(sugarIngredient.parentElement).not.toHaveClass('checked');

      fireEvent.click(sugarIngredient);
      expect(flourIngredient.parentElement).toHaveClass('checked');
      expect(sugarIngredient.parentElement).toHaveClass('checked');

      fireEvent.click(flourIngredient);
      expect(flourIngredient.parentElement).not.toHaveClass('checked');
      expect(sugarIngredient.parentElement).toHaveClass('checked');
    });

    test('closes modal when close button is clicked', () => {
      const onCloseMock = jest.fn();
      render(<RecipeModal recipe={mockRecipe} onClose={onCloseMock} />);

      // Test modal close functionality
      fireEvent.click(screen.getByText('X'));
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });

  // Edge case tests
  describe('Edge Cases', () => {
    test('handles recipe without ingredients', () => {
      render(<RecipeModal recipe={mockRecipeWithoutIngredients} onClose={jest.fn()} />);
      
      // Verify empty ingredients list is handled
      expect(screen.getByText('Ingredients:')).toBeInTheDocument();
      expect(screen.queryByText('Flour')).not.toBeInTheDocument();
      expect(screen.queryByText('Sugar')).not.toBeInTheDocument();
    });

    test('handles recipe without nutrition info', async () => {
      // Mock API response missing nutrition data
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockRecipeWithoutNutrition)
        })
      );

      await act(async () => {
        render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);
      });

      // Verify missing nutrition data is handled
      expect(screen.getByText('Calories: N/A')).toBeInTheDocument();
    });  
  });
});