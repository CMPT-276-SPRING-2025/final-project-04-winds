import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { useState } from 'react';

// Mock child components
jest.mock('../GlobalStyle', () => () => <div data-testid="global-style"></div>);
jest.mock('../Title_Card/Header', () => () => <div data-testid="header"></div>);
jest.mock('../Title_Card/TranslateBox', () => () => <div data-testid="translate-box"></div>);
jest.mock('../Title_Card/TTS', () => () => <div data-testid="tts"></div>);
jest.mock('../Recipe_Box/RecipeModal', () => ({ recipe, onClose }) => (
  recipe ? (
    <div data-testid="recipe-modal">
      <button onClick={onClose}>Close Modal</button>
      <div>{recipe.title}</div>
    </div>
  ) : null
));

jest.mock('../Ingredient_Box/IngredientsBox', () => ({ onSearch }) => (
  <div data-testid="ingredients-box">
    <button onClick={onSearch}>Search</button>
  </div>
));

jest.mock('../Recipe_Box/RecipeBox', () => (props) => {
  return (
    <div data-testid="recipe-box">
      {props.recipes && props.recipes.map((recipe) => (
        <div key={recipe.id} onClick={() => props.onRecipeClick(recipe)}>
          {recipe.title}
        </div>
      ))}
    </div>
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('App Component', () => {
  test('All App Components are loaded', () => {
    render(<App />);
    expect(screen.getByTestId('global-style')).toBeInTheDocument();
    expect(screen.getByTestId('ingredients-box')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-box')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('translate-box')).toBeInTheDocument();
    expect(screen.getByTestId('tts')).toBeInTheDocument();
  });

  test('Logo image is in the page', () => {
    render(<App />);
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/Media/Logo.gif');
  });

  test('Recipe modal opens and closes correctly', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ id: 1, title: 'Test Recipe' }]),
      })
    );

    render(<App />);

    // Click the search button to trigger API call
    fireEvent.click(screen.getByText('Search'));

    // Wait for the recipes to be displayed
    await waitFor(() => expect(screen.getByTestId('recipe-box')).toHaveTextContent('Test Recipe'));

    // Click on the recipe to open the modal
    fireEvent.click(screen.getByText('Test Recipe'));

    // Check if modal appears
    expect(screen.getByTestId('recipe-modal')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-modal')).toHaveTextContent('Test Recipe');

    // Close the modal
    fireEvent.click(screen.getByText('Close Modal'));

    // Ensure modal disappears
    await waitFor(() => expect(screen.queryByTestId('recipe-modal')).not.toBeInTheDocument());
  });

  test('handleSearchRecipes fetches recipes and updates state', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ id: 1, title: 'Test Recipe' }]),
      })
    );

    render(<App />);

    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => expect(screen.getByTestId('recipe-box')).toHaveTextContent('Test Recipe'));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.spoonacular.com/recipes/findByIngredients')
    );
  });
});
