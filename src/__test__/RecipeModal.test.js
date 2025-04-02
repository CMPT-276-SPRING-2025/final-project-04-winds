/* eslint-disable testing-library/no-wait-for-multiple-assertions */
/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-unnecessary-act */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import RecipeModal from '../Recipe_Box/RecipeModal';

const mockRecipe = {
  id: 1,
  title: 'Test Recipe',
  image: 'test-image.jpg',
  readyInMinutes: 30,
  usedIngredients: [{ name: 'Flour' }, { name: 'Eggs' }],
  missedIngredients: [{ name: 'Sugar' }, { name: 'Milk' }]
};

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

const mockRecipeWithoutInstructions = {
  ...mockRecipeInfo,
  instructions: undefined,
  analyzedInstructions: []
};

describe('RecipeModal Component', () => {
  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = false;
    global.fetch = jest.fn((url) => {
      if (url.includes('analyzedInstructions')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockRecipeInfo.analyzedInstructions)
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve(mockRecipeInfo)
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders modal with basic recipe details', () => {
    render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);

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
    fireEvent.error(image);
    expect(image).toHaveAttribute('src', '/Media/Logo.gif');
  });

  test('uses default image when recipe has no image', () => {
    render(<RecipeModal recipe={mockRecipeWithoutImage} onClose={jest.fn()} />);
    
    const image = screen.getByAltText('Test Recipe');
    expect(image).toHaveAttribute('src', '/Media/Logo.gif');
  });

  test('displays "N/A" when cooking time is not available', () => {
    render(<RecipeModal recipe={mockRecipeWithoutTime} onClose={jest.fn()} />);
    
    expect(screen.getByText('Cooking Time: N/A minutes')).toBeInTheDocument();
  });

  test('fetches and displays additional recipe info', async () => {
    await act(async () => {
      render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);
    });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

    expect(screen.getByText('Cooking Time: 45 minutes')).toBeInTheDocument();
    expect(screen.getByText('Calories: 250')).toBeInTheDocument();
    expect(screen.getByText('Step 1: Mix ingredients.')).toBeInTheDocument();
  });

  test('handles API fetch errors gracefully', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching recipe info:", expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  test('toggles ingredient selection', () => {
    render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);

    const flourIngredient = screen.getByText('Flour');
    const sugarIngredient = screen.getByText('Sugar');

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

    fireEvent.click(screen.getByText('X'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test('toggles between regular and detailed instructions', async () => {
    await act(async () => {
      render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);
    });

    expect(screen.getByText('Step 1: Mix ingredients.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Show Detailed Instructions'));
    
    await waitFor(() => {
      expect(screen.getByText('Mix dry ingredients')).toBeInTheDocument();
      expect(screen.getByText('Add wet ingredients')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Show Regular Instructions'));
    expect(screen.getByText('Step 1: Mix ingredients.')).toBeInTheDocument();
  });

  test('shows loading message while fetching recipe info', () => {
    render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);
    
    expect(screen.getByText('Loading instructions...')).toBeInTheDocument();
  });

  test('handles recipe without ingredients', () => {
    render(<RecipeModal recipe={mockRecipeWithoutIngredients} onClose={jest.fn()} />);
    
    expect(screen.getByText('Ingredients:')).toBeInTheDocument();
    expect(screen.queryByText('Flour')).not.toBeInTheDocument();
    expect(screen.queryByText('Sugar')).not.toBeInTheDocument();
  });

  test('handles recipe without nutrition info', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockRecipeWithoutNutrition)
      })
    );

    await act(async () => {
      render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);
    });

    expect(screen.getByText('Calories: N/A')).toBeInTheDocument();
  });

  test('handles recipe without any instructions', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockRecipeWithoutInstructions)
      })
    );

    await act(async () => {
      render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);
    });

    const notAvailableMessages = screen.getAllByText(/not available/i);
    expect(notAvailableMessages.length).toBeGreaterThanOrEqual(1);
  });

  test('does not fetch recipe info when recipe has no ID', () => {
    const recipeWithoutId = { ...mockRecipe, id: undefined };
    render(<RecipeModal recipe={recipeWithoutId} onClose={jest.fn()} />);
    
    expect(fetch).not.toHaveBeenCalled();
  });
});