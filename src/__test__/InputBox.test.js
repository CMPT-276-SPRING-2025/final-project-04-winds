import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputBox from '../Ingredient_Box/InputBox';

// Mock the error modal functionality to test error handling
const mockShowErrorModal = jest.fn();
jest.mock('../ErrorModal', () => {
  const originalModule = jest.requireActual('../ErrorModal');
  return {
    ...originalModule,
    useErrorModal: () => ({
      ...originalModule.useErrorModal(),
      showErrorModal: mockShowErrorModal
    })
  };
});

describe('InputBox', () => {
  // Common test data
  const mockIngredients = ['Tomato', 'Onion'];
  const mockSetIngredients = jest.fn();
  const mockOnIngredientsChange = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test to ensure isolation
    jest.clearAllMocks();
    
    // Mock the fetch API for ingredient suggestions
    // This provides consistent test data for autocomplete functionality
    global.fetch = jest.fn((url) => {
      if (url.includes('spoonacular.com')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { id: 1, name: 'Tomato' }, 
            { id: 2, name: 'Tomato Soup' }
          ]),
        });
      }
      // Mock for translation API - simulates translating Spanish to English
      return Promise.resolve({
        json: () => Promise.resolve({
          data: {
            translations: [
              { translatedText: 'Tomato', detectedSourceLanguage: 'es' }
            ]
          }
        })
      });
    });
  });

  afterEach(() => {
    // Clean up all mocks to prevent test pollution
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // Basic rendering tests
  test('Renders without crashing', () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
  });

  test('Renders the white box', () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    expect(screen.getByTestId('language-selector')).toBeInTheDocument();
  });

  test('Applies the correct styling to the white box', () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    expect(screen.getByTestId('language-selector')).toHaveClass('select-language');
  });

  test('Renders the input field with placeholder', () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    expect(screen.getByPlaceholderText('Type an ingredient...')).toBeInTheDocument();
  });

  // Autocomplete functionality tests
  test('Displays suggestions when input is typed', async () => {
    // Mock specific autocomplete API response for this test
    global.fetch = jest.fn((url) => {
      if (url.includes('spoonacular.com/food/ingredients/autocomplete')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, name: 'Tomato' },
            { id: 2, name: 'Tomato Soup' }
          ])
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Act must wrap state updates in React 18+
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
    });

    // Wait for the async autocomplete results to appear
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
      expect(screen.getByText('Tomato Soup')).toBeInTheDocument();
    });
  });

  test('Adds ingredient when suggestion is clicked', async () => {
    // Mock the ingredient autocomplete API for consistent testing
    global.fetch = jest.fn((url) => {
      if (url.includes('spoonacular.com/food/ingredients/autocomplete')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, name: 'Tomato' },
            { id: 2, name: 'Tomato soup' }
          ])
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Trigger input change to show suggestions
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
    });

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    // Click on a suggestion to select it
    fireEvent.click(screen.getByText('Tomato'));
    
    // Verify the ingredient was added and input was cleared
    expect(mockSetIngredients).toHaveBeenCalledWith(['Tomato']);
    expect(input.value).toBe('');
  });

  test('Adds ingredient when Enter is pressed', async () => {
    // Mock autocomplete API response
    global.fetch = jest.fn((url) => {
      if (url.includes('spoonacular.com/food/ingredients/autocomplete')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, name: 'Tomato' },
            { id: 2, name: 'Tomato soup' }
          ])
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Type an ingredient name
    act(() => {
      fireEvent.change(input, { target: { value: 'Tomato' } });
    });
    
    // Press Enter to add the ingredient
    fireEvent.keyDown(input, { key: 'Enter' });

    // Verify ingredient was added and input cleared
    expect(mockSetIngredients).toHaveBeenCalledWith(['Tomato']);
    expect(input.value).toBe('');
  });

  // Ingredient management tests
  test('Removes ingredient when remove button is clicked', () => {
    render(<InputBox ingredients={mockIngredients} setIngredients={mockSetIngredients} />);

    // Find all remove buttons (x) and click the first one
    const removeButtons = screen.getAllByText('x', { selector: 'button' });
    fireEvent.click(removeButtons[0]);

    // Verify Tomato was removed, leaving only Onion
    expect(mockSetIngredients).toHaveBeenCalledWith(['Onion']);
  });

  test('Calls onIngredientsChange when ingredients are updated', async () => {
    // Test that external callback is triggered when ingredients change
    render(
      <InputBox
        ingredients={[]}
        setIngredients={mockSetIngredients}
        onIngredientsChange={mockOnIngredientsChange}
      />
    );
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Type and submit an ingredient
    act(() => {
      fireEvent.change(input, { target: { value: 'Tomato' } });
    });
    
    fireEvent.keyDown(input, { key: 'Enter' });

    // Verify both state updater and external callback were called
    expect(mockSetIngredients).toHaveBeenCalledWith(['Tomato']);
    expect(mockOnIngredientsChange).toHaveBeenCalledWith(['Tomato']);
  });

  test('Prevents adding duplicate ingredients', async () => {
    // Test deduplication functionality
    render(<InputBox ingredients={['Tomato']} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Try to add an ingredient that already exists
    act(() => {
      fireEvent.change(input, { target: { value: 'Tomato' } });
    });
    
    fireEvent.keyDown(input, { key: 'Enter' });

    // Verify setIngredients wasn't called (no duplicate added)
    expect(mockSetIngredients).not.toHaveBeenCalled();
  });

  // Error handling tests
  test('Handles API errors gracefully', async () => {
    // Simulate API failure
    global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));
    
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Type to trigger autocomplete API call that will fail
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
    });

    // Verify component doesn't crash and recovers from the error
    await waitFor(() => {
      expect(input).toBeInTheDocument();
      expect(screen.queryByText('Tomato')).not.toBeInTheDocument();
    });
  });

  // UI interaction tests
  test('Clears suggestions on blur after delay', async () => {
    // Mock autocomplete API
    global.fetch = jest.fn((url) => {
      if (url.includes('spoonacular.com/food/ingredients/autocomplete')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, name: 'Tomato' },
            { id: 2, name: 'Tomato soup' }
          ])
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    // Use fake timers to control setTimeout behavior
    jest.useFakeTimers();
    
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Type to show suggestions
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
    });

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    // Trigger blur event and advance timer to simulate focus loss
    act(() => {
      fireEvent.blur(input);
      jest.advanceTimersByTime(200); // Advance past the 150ms timeout
    });

    // Verify suggestions are hidden after the delay
    expect(screen.queryByText('Tomato')).not.toBeInTheDocument();
    
    // Restore real timers
    jest.useRealTimers();
  });

  // Keyboard navigation tests
  test('Navigates suggestions with ArrowUp and ArrowDown keys', async () => {
    // Mock autocomplete API
    global.fetch = jest.fn((url) => {
      if (url.includes('spoonacular.com/food/ingredients/autocomplete')) {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue([
            { id: 1, name: 'Tomato' },
            { id: 2, name: 'Tomato Soup' }
          ])
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Show suggestions
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
    });

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    // Test arrow navigation through suggestions
    // First arrow down selects first item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByText('Tomato')).toHaveClass('active');

    // Second arrow down selects second item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByText('Tomato Soup')).toHaveClass('active');

    // Third arrow down wraps to first item (circular navigation)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByText('Tomato')).toHaveClass('active');

    // Arrow up wraps to last item
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(screen.getByText('Tomato Soup')).toHaveClass('active');
  });

  // Test will work once autocomplete is fixed
  test('Adds highlighted suggestion on Enter key press', async () => {
    // Mock autocomplete API
    global.fetch = jest.fn((url) => {
      if (url.includes('spoonacular.com/food/ingredients/autocomplete')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, name: 'Tomato' },
            { id: 2, name: 'Tomato soup' }
          ])
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Show suggestions
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
    });

    // Wait for suggestions to display
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    // Use keyboard navigation and selection
    fireEvent.keyDown(input, { key: 'ArrowDown' }); // Highlight first item
    fireEvent.keyDown(input, { key: 'Enter' }); // Select highlighted item

    // Verify the highlighted item was added
    expect(mockSetIngredients).toHaveBeenCalledWith(['Tomato']);
  });

  test('Clears input and suggestions after adding an ingredient', async () => {
    // Mock autocomplete API
    global.fetch = jest.fn((url) => {
      if (url.includes('spoonacular.com/food/ingredients/autocomplete')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, name: 'Tomato' },
            { id: 2, name: 'Tomato soup' }
          ])
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Show suggestions
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
    });

    // Wait for suggestions to display
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    // Add ingredient with Enter key
    fireEvent.keyDown(input, { key: 'Enter' });

    // Verify input is cleared and suggestions are hidden
    expect(input.value).toBe('');
    expect(screen.queryByText('Tomato')).not.toBeInTheDocument();
  });
  
  test('Shows suggestions on focus if input has value', async () => {
    // Mock autocomplete API
    global.fetch = jest.fn((url) => {
      if (url.includes('spoonacular.com/food/ingredients/autocomplete')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, name: 'Tomato' },
            { id: 2, name: 'Tomato soup' }
          ])
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Type text and then blur to hide suggestions
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
      // Clear suggestions that might appear due to change event
      fireEvent.blur(input);
    });
    
    // Verify suggestions are not visible
    await waitFor(() => {
      expect(screen.queryByText('Tomato')).not.toBeInTheDocument();
    });
    
    // Focus should trigger suggestions to reappear
    act(() => {
      fireEvent.focus(input);
    });
    
    // Verify suggestions appear on focus
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });
  });
});

// Tests for language translation functionality
describe('InputBox Translation Functionality', () => {
  const mockSetIngredients = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Translates non-English input to English for API call', async () => {
    // Mock fetch for both translation and ingredient suggestions
    global.fetch = jest.fn((url) => {
      if (url.includes('translation.googleapis.com')) {
        // Mock translation API response (Spanish -> English)
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: {
              translations: [
                { translatedText: 'tomato', detectedSourceLanguage: 'es' }
              ]
            }
          })
        });
      } else if (url.includes('spoonacular.com')) {
        // Verify that the translated term is used in the API call
        expect(url).toContain('query=tomato');
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue([
            { id: 1, name: 'Tomato' }
          ])
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    
    // Change language to Spanish
    const languageSelector = screen.getByTestId('language-selector');
    fireEvent.click(languageSelector);
    const spanishOption = screen.getByText(/spanish/i);
    fireEvent.click(spanishOption);
    
    // Type a Spanish word ("tomate" = tomato)
    const input = screen.getByPlaceholderText('Type an ingredient...');
    act(() => {
      fireEvent.change(input, { target: { value: 'tomate' } });
    });

    // Wait for translation and suggestions
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      // Verify correct translation request was made
      expect(global.fetch.mock.calls[0][1]).toEqual({
        body: JSON.stringify({
          q: "tomate",
          target: "en",
          source: "es",
          format: "text"
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      // Verify translated term was used for ingredient search
      expect(global.fetch.mock.calls[1][0]).toContain("tomato");
    });
    
    // Verify that suggestions are shown for the translated term
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });
  });

  test('Handles translation API errors gracefully', async () => {
    // Mock a failed translation but successful ingredients API
    global.fetch = jest.fn((url) => {
      if (url.includes('translation.googleapis.com')) {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue({ data: {} }) // Invalid response format
        });
      } else if (url.includes('spoonacular.com')) {
        // Should fall back to using original text
        expect(url).toContain('query=tomate');
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue([
            { id: 1, name: 'Tomato' }
          ])
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    
    // Change language to Spanish
    const languageSelector = screen.getByTestId('language-selector');
    fireEvent.click(languageSelector);
    const spanishOption = screen.getByText(/spanish/i);
    fireEvent.click(spanishOption);
    
    // Type a Spanish word
    const input = screen.getByPlaceholderText('Type an ingredient...');
    act(() => {
      fireEvent.change(input, { target: { value: 'tomate' } });
    });

    // Verify component falls back to using original text and still shows suggestions
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });
  });

  test('Handles invalid translation response gracefully', async () => {
    // Mock fetch responses with invalid translation data
    global.fetch = jest.fn((url) => {
      if (url.includes('translation.googleapis.com')) {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue({ data: {} }) // Invalid response format
        });
      } else if (url.includes('spoonacular.com')) {
        // Should fall back to using original text
        expect(url).toContain('query=tomate');
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue([
            { id: 1, name: 'Tomato' }
          ])
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    
    // Change language to Spanish
    const languageSelector = screen.getByTestId('language-selector');
    fireEvent.click(languageSelector);
    const spanishOption = screen.getByText(/spanish/i);
    fireEvent.click(spanishOption);
    
    // Type a Spanish word
    const input = screen.getByPlaceholderText('Type an ingredient...');
    fireEvent.change(input, { target: { value: 'tomate' } });

    // Wait for the error to be handled and the fallback to occur
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });
  });
});

// Tests for edge cases and robustness
describe('InputBox Edge Cases', () => {
  const mockSetIngredients = jest.fn();
  
  beforeEach(() => {    
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
  });

  test('Handles empty API response gracefully', async () => {
    // Mock empty response from ingredient API
    global.fetch = jest.fn(() => 
      Promise.resolve({
        json: () => Promise.resolve([])
      })
    );

    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Type an ingredient that returns no suggestions
    act(() => {
      fireEvent.change(input, { target: { value: 'nonexistentingredient' } });
    });

    // Verify no suggestions are displayed
    await waitFor(() => {
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });
    
    // Verify manual entry still works despite no suggestions
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockSetIngredients).toHaveBeenCalledWith(['nonexistentingredient']);
  });

  test('Handles malformed API response gracefully', async () => {
    // Mock null response from API (unexpected format)
    global.fetch = jest.fn(() => 
      Promise.resolve({
        json: () => Promise.resolve(null) // Unexpected null response
      })
    );

    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Type to trigger API call
    act(() => {
      fireEvent.change(input, { target: { value: 'tomato' } });
    });

    // Verify component handles error and continues functioning
    await waitFor(() => {
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
      expect(input).toBeInTheDocument(); // Component still exists
    });
  });

  test('Handles long ingredient names properly', async () => {
    // Mock API response with extremely long ingredient name
    global.fetch = jest.fn().mockResolvedValue({ 
      ok: true,
      json: () => Promise.resolve([
        { id: 1, name: 'Very long ingredient name that might cause UI issues when displayed in the suggestions list' }
      ])      
    });

    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Type to trigger API call
    act(() => {
      fireEvent.change(input, { target: { value: 'long' } });
    });

    // Verify long ingredient name is displayed properly
    await waitFor(() => {
      const suggestion = screen.getByText('Very long ingredient name that might cause UI issues when displayed in the suggestions list');
      expect(suggestion).toBeInTheDocument();
    });
    
    // Verify long ingredient name can be added correctly
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockSetIngredients).toHaveBeenCalledWith([
      'Very long ingredient name that might cause UI issues when displayed in the suggestions list'
    ]);
  });

  test('Handles API rate limiting or timeouts gracefully', async () => {
    // Simulate slow API response (5 seconds)
    global.fetch = jest.fn(() => 
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            json: () => Promise.resolve([{ id: 1, name: 'Tomato' }])
          });
        }, 5000); 
      })
    );
  
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Type to trigger slow API call
    act(() => {
      fireEvent.change(input, { target: { value: 'tomato' } });
    });
    
    // Add ingredient while API call is still pending
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Verify component doesn't wait for API and adds ingredient immediately
    expect(mockSetIngredients).toHaveBeenCalledWith(['tomato']);
  });

  test('Updates ingredients in parent component when removing an ingredient', () => {
    // Test removal and callback functionality
    const initialIngredients = ['Apple', 'Banana', 'Orange'];
    render(
      <InputBox 
        ingredients={initialIngredients} 
        setIngredients={mockSetIngredients}
        onIngredientsChange={mockSetIngredients} // Same function to verify
      />
    );
    
    // Find and click the remove button for "Banana"
    const removeButtons = screen.getAllByText('x', { selector: 'button' });
    fireEvent.click(removeButtons[1]); // Remove "Banana"
    
    // Verify both state update and callback functions are called
    expect(mockSetIngredients).toHaveBeenCalledWith(['Apple', 'Orange']);
    expect(mockSetIngredients).toHaveBeenCalledTimes(2); // Called twice (setIngredients and onIngredientsChange)
  });

  test('Handles special characters in ingredient names', async () => {
    // Mock API with special character responses
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, name: 'Café' },
        { id: 2, name: 'Jalapeño' }
      ])
    });

    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    // Type to trigger API call
    act(() => {
      fireEvent.change(input, { target: { value: 'special' } });
    });

    // Verify special characters display correctly
    await waitFor(() => {
      expect(screen.getByText('Café')).toBeInTheDocument();
      expect(screen.getByText('Jalapeño')).toBeInTheDocument();
    });
    
    // Verify ingredient with special character can be added
    fireEvent.click(screen.getByText('Jalapeño'));
    expect(mockSetIngredients).toHaveBeenCalledWith(['Jalapeño']);
  });
});