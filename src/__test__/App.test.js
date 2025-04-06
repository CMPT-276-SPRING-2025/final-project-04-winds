// Import testing utilities from React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Set mock API key for Spoonacular API
process.env.REACT_APP_SPOONACULAR_API_KEY = 'test-api-key';

// Shared mock function for error modal
const mockShowErrorModal = jest.fn();

// Mock child components to isolate App component testing
jest.mock('../GlobalStyle', () => () => <div data-testid="global-style"></div>);
jest.mock('../Title_Card/Header', () => () => <div data-testid="header"></div>);

// Mock IngredientsBox with simplified implementation
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

// Mock ErrorModal with controlled error display
jest.mock('../ErrorModal', () => ({
  useErrorModal: () => ({
    showErrorModal: mockShowErrorModal, // Mock function for testing error cases
  }),
}));

// Mock RecipeBox with filter and recipe display functionality
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
    {recipes && recipes.length > 0 && recipes.map(recipe => (
      <div key={recipe.id} onClick={() => onRecipeClick(recipe)} data-testid="recipe-item">
        {recipe.title}
      </div>
    ))}
    <div>Excluded: {excludedIngredients.join(',')}</div>
  </div>
));

// Mock RecipeModal with basic open/close functionality
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
    // Reset all mocks before each test to ensure clean state
    jest.resetAllMocks();
    mockShowErrorModal.mockClear();
  });

  // === BASIC RENDERING TESTS ===
  describe('Basic Rendering', () => {
    test('All components are loaded', () => {
      render(<App />)
      // Verify all main components render
      expect(screen.getByTestId('global-style')).toBeInTheDocument()
      expect(screen.getByTestId('ingredients-box')).toBeInTheDocument()
      expect(screen.getByTestId('recipe-box')).toBeInTheDocument()
      expect(screen.getByTestId('header')).toBeInTheDocument()
    });

    test('Logo renders correctly', () => {
      render(<App />)
      const logo = screen.getByAltText('Logo')
      // Verify logo image properties
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', '/Media/Logo.gif')
    });
  });

  // === RECIPE SEARCH FUNCTIONALITY TESTS ===
  describe('Recipe Search Functionality', () => {
    test('handles basic recipe search successfully', async () => {
      // Mock successful API response with sample recipe
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, title: 'Pasta Dish', image: 'pasta.jpg' }
          ])
        });

      render(<App />)
      
      // Simulate user adding ingredient
      const ingredientInput = screen.getByTestId('ingredient-input');
      fireEvent.change(ingredientInput, { target: { value: 'tomato' } });

      // Trigger search
      fireEvent.click(screen.getByText('Search'))

      // Verify recipe appears in results
      await waitFor(() => {
        expect(screen.getByText('Pasta Dish')).toBeInTheDocument()
      })
    });

    test('handles empty ingredients search', async () => {
      // Mock API failure
      global.fetch = jest.fn(() => Promise.reject(new Error('API Error')))
      
      render(<App />);
      fireEvent.click(screen.getByText('Search'))
      
      // Verify error modal is shown with appropriate message
      await waitFor(() => {
        expect(mockShowErrorModal).toHaveBeenCalledWith({
          context: "Error fetching recipes",
          message: "Spoonacular API may be down or you've reached your daily limit.",
        })
      })
    });
  });

  // === FILTER FUNCTIONALITY TESTS ===
  describe('Filter Functionality', () => {
    test('toggles diet filters correctly', () => {
      render(<App />);
      // Open filters section
      fireEvent.click(screen.getByText('Toggle Filters'));
      
      const diets = ['Vegan', 'Vegetarian', 'Gluten Free', 'Ketogenic', 'Paleo'];
      diets.forEach(diet => {
        const dietFilter = screen.getByText(diet);
        // Toggle each filter on
        fireEvent.click(dietFilter);
        expect(dietFilter).toHaveAttribute('data-selected', 'true');
        
        // Toggle each filter off
        fireEvent.click(dietFilter);
        expect(dietFilter).toHaveAttribute('data-selected', 'false');
      });
    });

    test('applies multiple diet filters', async () => {
      // Mock API responses for initial search and filtered results
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([{ id: 1, title: 'Test Recipe' }])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([{
            id: 1,
            title: 'Filtered Vegetarian Recipe',
            vegetarian: true,
            vegan: false,
            glutenFree: true,
            extendedIngredients: []
          }])
        });
      
      render(<App />);
      
      // Open filters
      fireEvent.click(screen.getByText('Toggle Filters'));
      
      // Select multiple diet filters
      fireEvent.click(screen.getByText('Vegetarian'));
      fireEvent.click(screen.getByText('Gluten Free'));
      
      // Add ingredient to enable search
      const ingredientInput = screen.getByTestId('ingredient-input');
      fireEvent.change(ingredientInput, { target: { value: 'tomato' } });
      
      // Trigger search
      fireEvent.click(screen.getByText('Search'));
      
      // Verify filtered recipe appears
      await waitFor(() => {
        expect(screen.getByText('Filtered Vegetarian Recipe')).toBeInTheDocument();
      });
    });
  });

  // === RECIPE MODAL TESTS ===
  describe('Recipe Modal Interaction', () => {
    test('opens and closes recipe modal correctly', async () => {
      // Mock successful API response
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, title: 'Test Recipe', image: 'test.jpg' }
          ])
        });

      render(<App />);
      
      // Add ingredient to enable search
      const ingredientInput = screen.getByTestId('ingredient-input');
      fireEvent.change(ingredientInput, { target: { value: 'tomato' } });
      
      // Trigger search
      fireEvent.click(screen.getByText('Search'));
      
      // Wait for recipe to load
      await waitFor(() => {
        expect(screen.getByText('Test Recipe')).toBeInTheDocument();
      });
      
      // Open modal by clicking recipe
      fireEvent.click(screen.getByText('Test Recipe'));
      
      // Verify modal opened
      expect(screen.getByTestId('recipe-modal')).toBeInTheDocument();
      
      // Close modal
      fireEvent.click(screen.getByText('Close Modal'));
      
      // Verify modal closed
      await waitFor(() => {
        expect(screen.queryByTestId('recipe-modal')).not.toBeInTheDocument();
      });
    });
  });

  // === EXCLUDED INGREDIENTS TESTS ===
  describe('Excluded Ingredients Functionality', () => {
    test('filters out recipes with excluded ingredients', async () => {
      // Mock API responses for initial search and detailed recipe
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, title: 'Recipe with Egg' }
          ])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([{
            id: 1,
            title: 'Recipe with Egg',
            extendedIngredients: [{ name: 'egg' }]
          }])
        });
      
      render(<App />);
      
      // Add ingredient to enable search
      const ingredientInput = screen.getByTestId('ingredient-input');
      fireEvent.change(ingredientInput, { target: { value: 'tomato' } });
      
      // Add excluded ingredient
      const excludeInput = screen.getByTestId('exclude-input');
      fireEvent.change(excludeInput, { target: { value: 'egg' } });
      
      // Trigger search
      fireEvent.click(screen.getByText('Search'));
      
      // Verify excluded recipe is filtered out
      await waitFor(() => {
        expect(screen.queryByText('Recipe with Egg')).not.toBeInTheDocument();
      });
    });
  });

  // === ERROR HANDLING TESTS ===
  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      // Mock network failure
      global.fetch = jest.fn(() => Promise.reject(new Error('Network Error')));
      
      render(<App />);
      
      // Add ingredient to trigger search
      const ingredientInput = screen.getByTestId('ingredient-input');
      fireEvent.change(ingredientInput, { target: { value: 'tomato' } });
      
      fireEvent.click(screen.getByText('Search'));
      
      // Verify error modal is shown
      await waitFor(() => {
        expect(mockShowErrorModal).toHaveBeenCalledWith({
          context: "Error fetching recipes",
          message: "Spoonacular API may be down or you've reached your daily limit.",
        })
      });
    });
    
    test('handles API errors correctly', async () => {
      // Mock API error response
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 402,
        statusText: 'Payment Required'
      });
      
      render(<App />);
      
      // Add ingredient to trigger search
      const ingredientInput = screen.getByTestId('ingredient-input');
      fireEvent.change(ingredientInput, { target: { value: 'tomato' } });
      
      fireEvent.click(screen.getByText('Search'));
      
      // Verify error modal is shown
      await waitFor(() => {
        expect(mockShowErrorModal).toHaveBeenCalled();
      });
    });
  });

  // === PERFORMANCE AND INTERACTION TESTS ===
  describe('Performance and Interaction', () => {
    test('handles rapid filter toggles', () => {
      render(<App />);
      const toggleButton = screen.getByText('Toggle Filters');
      
      // Simulate rapid user interaction
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      
      // Verify component handles rapid state changes
      expect(screen.queryByTestId('filters-section')).not.toBeInTheDocument();
    });
  });
});