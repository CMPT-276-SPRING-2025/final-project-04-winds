import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested - Filter component from Recipe Box feature
import Filter from '../Recipe_Box/Filter';

// Mock fetch globally for all API calls in the tests
global.fetch = jest.fn();

describe('Filter Component', () => {
  // Mock props to simulate different component states and behaviors
  const mockProps = {
    isToggled: false,                    // Default filter state (closed)
    filterToggle: jest.fn(),              // Mock function for toggling filter
    filterOptionToggle: jest.fn(),        // Mock function for diet option selection
    selectedFilters: [],                  // Initially no selected diet filters
    excludedIngredients: [],              // Initially no excluded ingredients
    setExcludedIngredients: jest.fn()     // Mock function for updating excluded ingredients
  };

  // Reset all mocks before each test to ensure clean test state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test suite for basic rendering and visual functionality
  describe('Rendering and Basic Functionality', () => {
    test('Renders without crashing', () => {
      render(<Filter {...mockProps} />);
    });

    test('Renders the Filter image with correct default state', () => {
      render(<Filter {...mockProps} />);
      
      // Verify the filter icon is present with default (non-active) image
      const filter = screen.getByTestId('filter');
      expect(filter).toBeInTheDocument();
      expect(filter).toHaveAttribute('src', '/Media/Filter.png');
    });

    test('Renders filter image with toggled state', () => {
      // Test with filter in active (toggled) state
      render(<Filter {...mockProps} isToggled={true} />);
      
      // Verify the filter icon shows active state image
      const filter = screen.getByTestId('filter');
      expect(filter).toHaveAttribute('src', '/Media/b-Filter.png');
    });
  });

  // Test suite for filter toggle functionality
  describe('Filter Toggle Functionality', () => {
    test('Calls filterToggle when filter image is clicked', () => {
      // Use a specific mock for filterToggle to verify calls
      const mockFilterToggle = jest.fn();
      render(<Filter {...mockProps} filterToggle={mockFilterToggle} />);
      
      // Simulate user clicking the filter icon
      const filterImage = screen.getByTestId('filter');
      fireEvent.click(filterImage);
      
      // Verify the toggle function was called
      expect(mockFilterToggle).toHaveBeenCalledTimes(1);
    });

    test('Renders diet options when toggled', () => {
      // Render with filter expanded (isToggled=true)
      render(<Filter {...mockProps} isToggled={true} />);
      
      // Verify all expected diet options are displayed
      const dietOptions = ['Vegan', 'Vegetarian', 'Gluten Free', 'Ketogenic', 'Paleo'];
      dietOptions.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });
  });

  // Test suite for diet option selection behavior
  describe('Diet Option Selection', () => {
    test('Calls filterOptionToggle when diet option is clicked', () => {
      // Use specific mock for option toggle function
      const mockFilterOptionToggle = jest.fn();
      render(<Filter 
        {...mockProps} 
        isToggled={true} 
        filterOptionToggle={mockFilterOptionToggle} 
      />);
      
      // Simulate clicking the Vegan option
      const veganOption = screen.getByText('Vegan');
      fireEvent.click(veganOption);
      
      // Verify the correct arguments were passed to the handler
      expect(mockFilterOptionToggle).toHaveBeenCalledWith('Vegan', expect.any(Object));
    });

    test('Applies selected class to diet option when selected', () => {
      // Render with Vegan filter already selected
      render(<Filter 
        {...mockProps} 
        isToggled={true} 
        selectedFilters={['Vegan']} 
      />);
      
      // Verify the Vegan option shows visual selected state
      const veganOption = screen.getByText('Vegan');
      expect(veganOption).toHaveClass('selected');
    });
  });

  // Test suite for excluded ingredients functionality
  describe('Excluded Ingredients Functionality', () => {
    test('Opens exclude ingredients popup', () => {
      render(<Filter 
        {...mockProps} 
        isToggled={true} 
      />);
      
      // Find and click the '+' button to open excluded ingredients popup
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);
      
      // Verify popup title appears
      expect(screen.getByText('Exclude Ingredients')).toBeInTheDocument();
    });

    test('Adds ingredient to excluded list', async () => {
      // Mock API response for ingredient autocomplete
      global.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve([{ id: 1, name: 'tomato' }]),
        ok: true
      });

      const mockSetExcludedIngredients = jest.fn();
      render(<Filter 
        {...mockProps} 
        isToggled={true} 
        setExcludedIngredients={mockSetExcludedIngredients}
      />);
      
      // Open the excluded ingredients popup
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Find input and simulate typing 'tomato'
      const input = screen.getByPlaceholderText('Type an ingredient...');
      fireEvent.change(input, { target: { value: 'tomato' } });

      // Wait for suggestions to appear and select 'tomato'
      await waitFor(() => {
        const suggestion = screen.getByText('tomato');
        fireEvent.click(suggestion);
      });

      // Verify the ingredient was added to excluded list
      expect(mockSetExcludedIngredients).toHaveBeenCalledWith(expect.arrayContaining(['tomato']));
    });

    test('Removes ingredient from excluded list', () => {
      const mockSetExcludedIngredients = jest.fn();
      render(<Filter 
        {...mockProps} 
        isToggled={true} 
        excludedIngredients={['tomato']}
        setExcludedIngredients={mockSetExcludedIngredients}
      />);
      
      // Find and click the 'x' button to remove ingredient
      const removeButton = screen.getByText('x');
      fireEvent.click(removeButton);
      
      // Verify the ingredient was removed (empty array passed)
      expect(mockSetExcludedIngredients).toHaveBeenCalledWith([]);
    });
  });

  // Test suite for keyboard navigation in ingredient suggestions
  describe('Keyboard Navigation', () => {
    test('Navigates through suggestions using arrow keys', async () => {
      // Mock API response with multiple suggestions
      global.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve([
          { id: 1, name: 'tomato' },
          { id: 2, name: 'potato' }
        ]),
        ok: true
      });

      render(<Filter 
        {...mockProps} 
        isToggled={true} 
      />);
      
      // Open excluded ingredients popup
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Find input and simulate typing
      const input = screen.getByPlaceholderText('Type an ingredient...');
      fireEvent.change(input, { target: { value: 't' } });

      // Wait for suggestions to appear
      await waitFor(() => {
        const suggestions = screen.getAllByRole('listitem');
        expect(suggestions).toHaveLength(2);
      });

      // Test arrow down key navigation
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
      
      // Test arrow up key navigation
      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
    });
  });

  // Test suite for edge cases and error handling
  describe('Edge Cases', () => {
    test('Handles empty ingredient input', () => {
      const mockSetExcludedIngredients = jest.fn();
      render(<Filter 
        {...mockProps} 
        isToggled={true} 
        setExcludedIngredients={mockSetExcludedIngredients}
      />);
      
      // Open excluded ingredients popup
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Simulate empty input and pressing Enter
      const input = screen.getByPlaceholderText('Type an ingredient...');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      // Verify no action was taken for empty input
      expect(mockSetExcludedIngredients).not.toHaveBeenCalled();
    });

    test('Prevents duplicate ingredient addition', () => {
      const mockSetExcludedIngredients = jest.fn();
      render(<Filter 
        {...mockProps} 
        isToggled={true} 
        excludedIngredients={['tomato']}
        setExcludedIngredients={mockSetExcludedIngredients}
      />);
      
      // Open excluded ingredients popup
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Try to add an ingredient that's already excluded
      const input = screen.getByPlaceholderText('Type an ingredient...');
      fireEvent.change(input, { target: { value: 'tomato' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      // Verify no duplicate was added
      expect(mockSetExcludedIngredients).not.toHaveBeenCalled();
    });
  });
});