
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import Filter from '../Recipe_Box/Filter';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Filter Component', () => {
  // Mock props to simulate component behavior
  const mockProps = {
    isToggled: false,
    filterToggle: jest.fn(),
    filterOptionToggle: jest.fn(),
    selectedFilters: [],
    excludedIngredients: [],
    setExcludedIngredients: jest.fn()
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Rendering and Basic Functionality Tests
  describe('Rendering and Basic Functionality', () => {
    test('Renders without crashing', () => {
      render(<Filter {...mockProps} />);
    });

    test('Renders the Filter image with correct default state', () => {
      render(<Filter {...mockProps} />);
      
      const filter = screen.getByTestId('filter');
      expect(filter).toBeInTheDocument();
      expect(filter).toHaveAttribute('src', '/Media/Filter.png');
    });

    test('Renders filter image with toggled state', () => {
      render(<Filter {...mockProps} isToggled={true} />);
      
      const filter = screen.getByTestId('filter');
      expect(filter).toHaveAttribute('src', '/Media/b-Filter.png');
    });
  });

  // Filter Toggle Functionality Tests
  describe('Filter Toggle Functionality', () => {
    test('Calls filterToggle when filter image is clicked', () => {
      const mockFilterToggle = jest.fn();
      render(<Filter {...mockProps} filterToggle={mockFilterToggle} />);
      
      const filterImage = screen.getByTestId('filter');
      fireEvent.click(filterImage);
      
      expect(mockFilterToggle).toHaveBeenCalledTimes(1);
    });

    test('Renders diet options when toggled', () => {
      render(<Filter {...mockProps} isToggled={true} />);
      
      const dietOptions = ['Vegan', 'Vegetarian', 'Gluten Free', 'Ketogenic', 'Paleo'];
      dietOptions.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });
  });

  // Diet Option Selection Tests
  describe('Diet Option Selection', () => {
    test('Calls filterOptionToggle when diet option is clicked', () => {
      const mockFilterOptionToggle = jest.fn();
      render(<Filter 
        {...mockProps} 
        isToggled={true} 
        filterOptionToggle={mockFilterOptionToggle} 
      />);
      
      const veganOption = screen.getByText('Vegan');
      fireEvent.click(veganOption);
      
      expect(mockFilterOptionToggle).toHaveBeenCalledWith('Vegan', expect.any(Object));
    });

    test('Applies selected class to diet option when selected', () => {
      render(<Filter 
        {...mockProps} 
        isToggled={true} 
        selectedFilters={['Vegan']} 
      />);
      
      const veganOption = screen.getByText('Vegan');
      expect(veganOption).toHaveClass('selected');
    });
  });

  // Excluded Ingredients Tests
  describe('Excluded Ingredients Functionality', () => {
    test('Opens exclude ingredients popup', () => {
      render(<Filter 
        {...mockProps} 
        isToggled={true} 
      />);
      
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);
      
      expect(screen.getByText('Exclude Ingredients')).toBeInTheDocument();
    });

    test('Adds ingredient to excluded list', async () => {
      // Mock fetch for autocomplete suggestions
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
      
      // Open popup
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Find input and add ingredient
      const input = screen.getByPlaceholderText('Type an ingredient...');
      fireEvent.change(input, { target: { value: 'tomato' } });

      // Wait for suggestions and select
      await waitFor(() => {
        const suggestion = screen.getByText('tomato');
        fireEvent.click(suggestion);
      });

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
      
      const removeButton = screen.getByText('x');
      fireEvent.click(removeButton);
      
      expect(mockSetExcludedIngredients).toHaveBeenCalledWith([]);
    });
  });

  // Keyboard Navigation Tests
  describe('Keyboard Navigation', () => {
    test('Navigates through suggestions using arrow keys', async () => {
      // Mock fetch for autocomplete suggestions
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
      
      // Open popup
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Find input and type
      const input = screen.getByPlaceholderText('Type an ingredient...');
      fireEvent.change(input, { target: { value: 't' } });

      // Wait for suggestions
      await waitFor(() => {
        const suggestions = screen.getAllByRole('listitem');
        expect(suggestions).toHaveLength(2);
      });

      // Test arrow down
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
      
      // Test arrow up
      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    test('Handles empty ingredient input', () => {
      const mockSetExcludedIngredients = jest.fn();
      render(<Filter 
        {...mockProps} 
        isToggled={true} 
        setExcludedIngredients={mockSetExcludedIngredients}
      />);
      
      // Open popup
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Find input and add empty string
      const input = screen.getByPlaceholderText('Type an ingredient...');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
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
      
      // Open popup
      const addButton = screen.getByText('+');
      fireEvent.click(addButton);

      // Find input and try to add existing ingredient
      const input = screen.getByPlaceholderText('Type an ingredient...');
      fireEvent.change(input, { target: { value: 'tomato' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      expect(mockSetExcludedIngredients).not.toHaveBeenCalled();
    });
  });
});

