/* eslint-disable testing-library/no-unnecessary-act */
/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import RecipeModal from '../Recipe_Box/RecipeModal';

const mockRecipe = {
  id: 1,
  title: 'Test Recipe',
  image: 'test-image.jpg',
  readyInMinutes: 30,
  usedIngredients: [{ name: 'Flour' }],
  missedIngredients: [{ name: 'Sugar' }]
};

const mockRecipeInfo = {
  readyInMinutes: 45,
  nutrition: {
    nutrients: [{ name: 'Calories', amount: 250 }]
  },
  instructions: '<p>Step 1: Mix ingredients.</p>'
};

describe('RecipeModal Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockRecipeInfo)
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders modal with recipe details', () => {
    render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);

    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByAltText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('Ingredients:')).toBeInTheDocument();
    expect(screen.getByText('Flour')).toBeInTheDocument();
    expect(screen.getByText('Sugar')).toBeInTheDocument();
  });

  test('fetches additional recipe info and updates the UI', async () => {
    await act(async () => {
      render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);
    });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    expect(screen.getByText('Cooking Time: 45 minutes')).toBeInTheDocument();
    expect(screen.getByText('Calories: 250')).toBeInTheDocument();
    expect(screen.getByText('Step 1: Mix ingredients.')).toBeInTheDocument();
  });

  test('toggles ingredient selection', () => {
    render(<RecipeModal recipe={mockRecipe} onClose={jest.fn()} />);

    const ingredient = screen.getByText('Flour');
    fireEvent.click(ingredient);
    expect(ingredient.parentElement).toHaveClass('checked');

    fireEvent.click(ingredient);
    expect(ingredient.parentElement).not.toHaveClass('checked');
  });

  test('closes modal when close button is clicked', () => {
    const onCloseMock = jest.fn();
    render(<RecipeModal recipe={mockRecipe} onClose={onCloseMock} />);

    fireEvent.click(screen.getByText('X'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
