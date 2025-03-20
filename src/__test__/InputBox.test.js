import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputBox from '../Ingredient_Box/InputBox';

describe('InputBox', () => {
  const mockIngredients = ['Tomato', 'Onion'];
  const mockSetIngredients = jest.fn();
  const mockOnIngredientsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the fetch API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ id: 1, name: 'Tomato' }, { id: 2, name: 'Tomato Soup' }]),
      })
    );
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
    fireEvent.change(input, { target: { value: 'Tom' } });

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
      expect(screen.getByText('Tomato Soup')).toBeInTheDocument();
    });
  });

  test('Adds ingredient when suggestion is clicked', async () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    fireEvent.change(input, { target: { value: 'Tom' } });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Tomato'));
      expect(mockSetIngredients).toHaveBeenCalledWith(['Tomato']);
    });
  });

  test('Adds ingredient when Enter is pressed', async () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    fireEvent.change(input, { target: { value: 'Tomato' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockSetIngredients).toHaveBeenCalledWith(['Tomato']);
    });
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
    fireEvent.change(input, { target: { value: 'Tomato' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnIngredientsChange).toHaveBeenCalledWith(['Tomato']);
    });
  });

  test('Prevents adding duplicate ingredients', async () => {
    render(<InputBox ingredients={['Tomato']} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    fireEvent.change(input, { target: { value: 'Tomato' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockSetIngredients).not.toHaveBeenCalled();
    });
  });

  test('Handles API errors gracefully', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    fireEvent.change(input, { target: { value: 'Tom' } });

    await waitFor(() => {
      expect(screen.queryByText('Tomato')).not.toBeInTheDocument();
    });
  });

  test('Handles API errors problemless', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    fireEvent.change(input, { target: { value: 'Tom' } });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching suggestions:', expect.any(Error));
    });

    console.error.mockRestore();
  });

  test('Clears suggestions on blur after delay', async () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    fireEvent.change(input, { target: { value: 'Tom' } });

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.queryByText('Tomato')).not.toBeInTheDocument();
    });
  });

  test('Navigates suggestions with ArrowUp and ArrowDown keys', async () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    fireEvent.change(input, { target: { value: 'Tom' } });

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByText('Tomato')).toHaveClass('active');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByText('Tomato Soup')).toHaveClass('active');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(screen.getByText('Tomato')).toHaveClass('active');
  });

  test('Adds highlighted suggestion on Enter key press', async () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    fireEvent.change(input, { target: { value: 'Tom' } });

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockSetIngredients).toHaveBeenCalledWith(['Tomato']);
    });
  });

  test('Clears suggestions and resets selected index when input is empty', async () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    fireEvent.change(input, { target: { value: 'Tom' } });

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    fireEvent.change(input, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.queryByText('Tomato')).not.toBeInTheDocument();
    });
  });
});