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