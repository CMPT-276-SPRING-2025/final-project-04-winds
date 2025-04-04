import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputBox from '../Ingredient_Box/InputBox';

describe('InputBox', () => {
  const mockIngredients = ['Tomato', 'Onion'];
  const mockSetIngredients = jest.fn();
  const mockOnIngredientsChange = jest.fn();

  beforeEach(() => {
    
    jest.clearAllMocks();
    // Mock the fetch API for ingredient suggestions
    global.fetch = jest.fn((url) => {
      if (url.includes('spoonacular.com')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            { id: 1, name: 'Tomato' }, 
            { id: 2, name: 'Tomato Soup' }
          ]),
        });
      }
      // Mock for translation API
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
    jest.restoreAllMocks();
    jest.useRealTimers()
  });

  test('Renders without crashing', () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
  });

  test('Renders the white box', () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    expect(screen.getByTestId('white-box')).toBeInTheDocument();
  });

  test('Applies the correct styling to the white box', () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    expect(screen.getByTestId('white-box')).toHaveClass('white-box');
  });

  test('Renders the input field with placeholder', () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    expect(screen.getByPlaceholderText('Type an ingredient...')).toBeInTheDocument();
  });

  test('Displays suggestions when input is typed', async () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
      expect(screen.getByText('Tomato Soup')).toBeInTheDocument();
    });
  });

  test('Adds ingredient when suggestion is clicked', async () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Tomato'));
    
    expect(mockSetIngredients).toHaveBeenCalledWith(['Tomato']);
    expect(input.value).toBe('');
  });

  test('Adds ingredient when Enter is pressed', async () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'Tomato' } });
    });
    
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockSetIngredients).toHaveBeenCalledWith(['Tomato']);
    expect(input.value).toBe('');
  });

  test('Removes ingredient when remove button is clicked', () => {
    render(<InputBox ingredients={mockIngredients} setIngredients={mockSetIngredients} />);

    const removeButtons = screen.getAllByText('x', { selector: 'button' });
    fireEvent.click(removeButtons[0]);

    expect(mockSetIngredients).toHaveBeenCalledWith(['Onion']);
  });

  test('Calls onIngredientsChange when ingredients are updated', async () => {
    render(
      <InputBox
        ingredients={[]}
        setIngredients={mockSetIngredients}
        onIngredientsChange={mockOnIngredientsChange}
      />
    );
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'Tomato' } });
    });
    
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockSetIngredients).toHaveBeenCalledWith(['Tomato']);
    expect(mockOnIngredientsChange).toHaveBeenCalledWith(['Tomato']);
  });

  test('Prevents adding duplicate ingredients', async () => {
    render(<InputBox ingredients={['Tomato']} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'Tomato' } });
    });
    
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockSetIngredients).not.toHaveBeenCalled();
  });

  test('Handles API errors gracefully', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));
    
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
    });

    // Wait for the component to stabilize after error handling
    await waitFor(() => {
      // Should not crash the component
      expect(input).toBeInTheDocument();
      expect(screen.queryByText('Tomato')).not.toBeInTheDocument();
    });
  });

  test('Clears suggestions on blur after delay', async () => {
    jest.useFakeTimers();
    
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    act(() => {
      fireEvent.blur(input);
      jest.advanceTimersByTime(200); // Advance timer past the 150ms timeout
    });

    expect(screen.queryByText('Tomato')).not.toBeInTheDocument();
    
    jest.useRealTimers();
  });

  test('Navigates suggestions with ArrowUp and ArrowDown keys', async () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    // First arrow down selects first item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByText('Tomato')).toHaveClass('active');

    // Second arrow down selects second item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByText('Tomato Soup')).toHaveClass('active');

    // Third arrow down wraps to first item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByText('Tomato')).toHaveClass('active');

    // Arrow up wraps to last item
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(screen.getByText('Tomato Soup')).toHaveClass('active');
  });

  // Test will work once autocomplete is fixed
  test('Adds highlighted suggestion on Enter key press', async () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockSetIngredients).toHaveBeenCalledWith(['Tomato']);
  });

  test('Clears input and suggestions after adding an ingredient', async () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input.value).toBe('');
    expect(screen.queryByText('Tomato')).not.toBeInTheDocument();
  });
  
  test('Shows suggestions on focus if input has value', async () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'Tom' } });
      // Clear suggestions that might appear due to change event
      fireEvent.blur(input);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Tomato')).not.toBeInTheDocument();
    });
    
    // Focus should trigger suggestions to reappear
    act(() => {
      fireEvent.focus(input);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });
  });
});

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
        return Promise.resolve({
          json: () => Promise.resolve({
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
          json: () => Promise.resolve([
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

    // Wait for translation and suggestions
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
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
        return Promise.reject(new Error('Translation API Error'));
      } else if (url.includes('spoonacular.com')) {
        // Should fall back to using original text
        expect(url).toContain('query=tomate');
        return Promise.resolve({
          json: () => Promise.resolve([
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

    // Should still show suggestions using the original input
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });
  });

  test('Handles invalid translation response gracefully', async () => {
    // Mock an invalid translation response format
    global.fetch = jest.fn((url) => {
      if (url.includes('translation.googleapis.com')) {
        return Promise.resolve({
          json: () => Promise.resolve({ data: {} }) // Missing translations
        });
      } else if (url.includes('spoonacular.com')) {
        // Should fall back to using original text
        expect(url).toContain('query=tomate');
        return Promise.resolve({
          json: () => Promise.resolve([
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

describe('InputBox Edge Cases', () => {
  const mockSetIngredients = jest.fn();
  
  beforeEach(() => {    
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Handles empty API response gracefully', async () => {
    global.fetch = jest.fn(() => 
      Promise.resolve({
        json: () => Promise.resolve([])
      })
    );

    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'nonexistentingredient' } });
    });

    // Should not display any suggestions
    await waitFor(() => {
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });
    
    // Should still allow manual entry
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockSetIngredients).toHaveBeenCalledWith(['nonexistentingredient']);
  });

  test('Handles malformed API response gracefully', async () => {
    global.fetch = jest.fn(() => 
      Promise.resolve({
        json: () => Promise.resolve(null) // Unexpected null response
      })
    );

    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'tomato' } });
    });

    // Should handle the error and not crash
    await waitFor(() => {
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
      expect(input).toBeInTheDocument(); // Component still exists
    });
  });

  

  test('Handles long ingredient names properly', async () => {
    global.fetch = jest.fn(() => 
      Promise.resolve({
        json: () => Promise.resolve([
          { id: 1, name: 'Very long ingredient name that might cause UI issues when displayed in the suggestions list' }
        ])
      })
    );

    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'long' } });
    });

    await waitFor(() => {
      const suggestion = screen.getByText('Very long ingredient name that might cause UI issues when displayed in the suggestions list');
      expect(suggestion).toBeInTheDocument();
    });
    
    // Should be able to add the long ingredient name
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockSetIngredients).toHaveBeenCalledWith([
      'Very long ingredient name that might cause UI issues when displayed in the suggestions list'
    ]);
  });

  test('Handles API rate limiting or timeouts gracefully', async () => {
    // Simulate a timeout
    global.fetch = jest.fn(() => 
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            json: () => Promise.resolve([{ id: 1, name: 'Tomato' }])
          });
        }, 5000); // Long timeout
      })
    );

    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'tomato' } });
    });
    
    // Try adding the ingredient while the API call is still pending
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Should add the manually entered value without waiting for API
    expect(mockSetIngredients).toHaveBeenCalledWith(['tomato']);
  });

  test('Updates ingredients in parent component when removing an ingredient', () => {
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
    
    // Should call both state update functions
    expect(mockSetIngredients).toHaveBeenCalledWith(['Apple', 'Orange']);
    expect(mockSetIngredients).toHaveBeenCalledTimes(2); // Called twice (setIngredients and onIngredientsChange)
  });

  test('Handles special characters in ingredient names', async () => {
    global.fetch = jest.fn(() => 
      Promise.resolve({
        json: () => Promise.resolve([
          { id: 1, name: 'Café' },
          { id: 2, name: 'Jalapeño' }
        ])
      })
    );

    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    
    act(() => {
      fireEvent.change(input, { target: { value: 'special' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Café')).toBeInTheDocument();
      expect(screen.getByText('Jalapeño')).toBeInTheDocument();
    });
    
    // Should be able to add ingredients with special characters
    fireEvent.click(screen.getByText('Jalapeño'));
    expect(mockSetIngredients).toHaveBeenCalledWith(['Jalapeño']);
  });
});