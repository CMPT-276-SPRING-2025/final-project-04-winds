import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock environment variables
process.env.REACT_APP_SPOONACULAR_API_KEY = 'test-api-key';

// Mock child components
jest.mock('../GlobalStyle', () => () => <div data-testid="global-style"></div>);
jest.mock('../Title_Card/Header', () => () => <div data-testid="header"></div>);
jest.mock('../Ingredient_Box/IngredientsBox', () => ({ onSearch, ingredients, setIngredients }) => (
  <div data-testid="ingredients-box">
    <button onClick={onSearch}>Search</button>
    <input 
      data-testid="ingredient-input"
      onChange={(e) => setIngredients([e.target.value])}
    />
    <div>{ingredients.join(',')}</div>
  </div>
));

jest.mock('../Recipe_Box/RecipeBox', () => ({ 
  recipes, 
  onRecipeClick, 
  isToggled, 
  filterToggle, 
  filterOptionToggle, 
  selectedFilters, 
  excludedIngredients,
  setExcludedIngredients 
}) => (
  <div data-testid="recipe-box">
    <button onClick={filterToggle}>Toggle Filters</button>
    {isToggled && (
      <div data-testid="filters-section">
        {['Vegan', 'Vegetarian', 'Gluten Free', 'Ketogenic', 'Paleo'].map(diet => (
          <div 
            key={diet} 
            onClick={(e) => filterOptionToggle(diet, e)} 
            data-selected={selectedFilters.includes(diet)}
          >
            {diet}
          </div>
        ))}
      </div>
    )}
    <input 
      data-testid="exclude-input"
      onChange={(e) => setExcludedIngredients([e.target.value])}
    />
    {recipes?.map(recipe => (
      <div key={recipe.id} onClick={() => onRecipeClick(recipe)}>
        {recipe.title}
      </div>
    ))}
    <div>Excluded: {excludedIngredients.join(',')}</div>
  </div>
));

jest.mock('../Recipe_Box/RecipeModal', () => ({ recipe, onClose }) => (
  recipe ? (
    <div data-testid="recipe-modal">
      <button onClick={onClose}>Close Modal</button>
      <div>{recipe.title}</div>
    </div>
  ) : null
));

describe('App Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
    global.console.error = jest.fn();
  });

  // Basic Rendering Tests
  describe('Basic Rendering', () => {
    test('All components are loaded', () => {
      render(<App />)
      expect(screen.getByTestId('global-style')).toBeInTheDocument()
      expect(screen.getByTestId('ingredients-box')).toBeInTheDocument()
      expect(screen.getByTestId('recipe-box')).toBeInTheDocument()
      expect(screen.getByTestId('header')).toBeInTheDocument()
    });

    test('Logo renders correctly', () => {
      render(<App />)
      const logo = screen.getByAltText('Logo')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', '/Media/Logo.gif')
    });
  });

  // Recipe Search Functionality Tests
  describe('Recipe Search Functionality', () => {
    test('handles basic recipe search successfully', async () => {
      // Mock successful API responses
      global.fetch = jest.fn()
        .mockImplementationOnce(() => Promise.resolve({
          json: () => Promise.resolve([
            { id: 1, title: 'Pasta Dish', image: 'pasta.jpg' }
          ])
        }));

      render(<App />)
      
      // Add an ingredient
      const ingredientInput = screen.getByTestId('ingredient-input');
      fireEvent.change(ingredientInput, { target: { value: 'tomato' } });

      // Trigger search
      fireEvent.click(screen.getByText('Search'))

      await waitFor(() => {
        expect(screen.getByText('Pasta Dish')).toBeInTheDocument()
      })
    });

    test('handles empty ingredients search', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('API Error')))
      
      render(<App />);
      fireEvent.click(screen.getByText('Search'))
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          "Error fetching recipes:", 
          expect.any(Error)
        )
      })
    });
  });

  // Filter Functionality Tests
  describe('Filter Functionality', () => {
    test('toggles diet filters correctly', () => {
      render(<App />);
      fireEvent.click(screen.getByText('Toggle Filters'));
      
      const diets = ['Vegan', 'Vegetarian', 'Gluten Free', 'Ketogenic', 'Paleo'];
      diets.forEach(diet => {
        const dietFilter = screen.getByText(diet);
        fireEvent.click(dietFilter);
        expect(dietFilter).toHaveAttribute('data-selected', 'true');
        
        fireEvent.click(dietFilter);
        expect(dietFilter).toHaveAttribute('data-selected', 'false');
      });
    });

    test('applies multiple diet filters', async () => {
      global.fetch = jest.fn()
        .mockImplementationOnce(() => Promise.resolve({
          json: () => Promise.resolve([{ id: 1, title: 'Test Recipe' }])
        }))
        .mockImplementationOnce(() => Promise.resolve({
          json: () => Promise.resolve([{
            id: 1,
            title: 'Filtered Vegetarian Recipe',
            vegetarian: true,
            vegan: false,
            glutenFree: true,
            extendedIngredients: []
          }])
        }));
      
      render(<App />);
      
      // Open filters
      fireEvent.click(screen.getByText('Toggle Filters'));
      
      // Select multiple filters
      fireEvent.click(screen.getByText('Vegetarian'));
      fireEvent.click(screen.getByText('Gluten Free'));
      
      // Trigger search
      fireEvent.click(screen.getByText('Search'));
      
      await waitFor(() => {
        expect(screen.getByText('Filtered Vegetarian Recipe')).toBeInTheDocument();
      });
    });
  });

  // Recipe Modal Tests
  describe('Recipe Modal Interaction', () => {
    test('opens and closes recipe modal correctly', async () => {
      global.fetch = jest.fn()
        .mockImplementationOnce(() => Promise.resolve({
          json: () => Promise.resolve([{ id: 1, title: 'Test Recipe', image: 'test.jpg' }])
        }))
        .mockImplementationOnce(() => Promise.resolve({
          json: () => Promise.resolve([{
            id: 1,
            title: 'Test Recipe Details',
            image: 'test.jpg'
          }])
        }));

      render(<App/>)
      
      // Trigger search
      fireEvent.click(screen.getByText('Search'))

      await waitFor(() => {
        fireEvent.click(screen.getByText('Test Recipe'))
      })

      // Verify modal opened
      expect(screen.getByTestId('recipe-modal')).toBeInTheDocument()
      
      // Close modal
      fireEvent.click(screen.getByText('Close Modal'))

      await waitFor(() => {
        expect(screen.queryByTestId('recipe-modal')).not.toBeInTheDocument()
      })
    });
  });

  // Excluded Ingredients Tests
  describe('Excluded Ingredients Functionality', () => {
    test('filters out recipes with excluded ingredients', async () => {
      global.fetch = jest.fn()
        .mockImplementationOnce(() => Promise.resolve({
          json: () => Promise.resolve([{ id: 1, title: 'Recipe with Egg' }])
        }))
        .mockImplementationOnce(() => Promise.resolve({
          json: () => Promise.resolve([{
            id: 1,
            title: 'Recipe with Egg',
            extendedIngredients: [{ name: 'egg' }]
          }])
        }));
      
      render(<App />);
      
      // Add excluded ingredient
      const excludeInput = screen.getByTestId('exclude-input');
      fireEvent.change(excludeInput, { target: { value: 'egg' } });
      
      // Trigger search
      fireEvent.click(screen.getByText('Search'));
      
      await waitFor(() => {
        expect(screen.queryByText('Recipe with Egg')).not.toBeInTheDocument();
      });
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network Error')));
      
      render(<App />);
      
      // Add an ingredient to trigger search
      const ingredientInput = screen.getByTestId('ingredient-input');
      fireEvent.change(ingredientInput, { target: { value: 'tomato' } });
      
      fireEvent.click(screen.getByText('Search'));
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          "Error fetching recipes:", 
          expect.any(Error)
        )
      });
    });
  });

  // Performance and Interaction Tests
  describe('Performance and Interaction', () => {
    test('handles rapid filter toggles', () => {
      render(<App />);
      const toggleButton = screen.getByText('Toggle Filters');
      
      // Quickly toggle filters multiple times
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      
      // Verify final state
      expect(screen.queryByTestId('filters-section')).not.toBeInTheDocument();
    });
  });
});