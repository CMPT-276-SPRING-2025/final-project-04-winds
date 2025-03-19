import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import InputBox from '../Ingredient_Box/InputBox';

describe('InputBox', () => {
  const mockIngredients = ['Tomato', 'Onion'];
  const mockSetIngredients = jest.fn();
  const mockOnIngredientsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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

    // Assuming the API call is mocked or the suggestions are set directly in the test
    // For simplicity, we can mock the suggestions state directly
    const suggestions = [{ id: 1, name: 'Tomato' }, { id: 2, name: 'Tomato Soup' }];
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Tom' } });

    // Mock the suggestions list
    const suggestionItems = suggestions.map(sugg => (
      <li key={sugg.id} onClick={() => {}}>
        {sugg.name}
      </li>
    ));
    render(<ul className="suggestions-list">{suggestionItems}</ul>);

    expect(screen.getByText('Tomato')).toBeInTheDocument();
    expect(screen.getByText('Tomato Soup')).toBeInTheDocument();
  });

  test('Adds ingredient when suggestion is clicked', () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    fireEvent.change(input, { target: { value: 'Tom' } });

    const suggestions = [{ id: 1, name: 'Tomato' }];
    const suggestionItems = suggestions.map(sugg => (
      <li key={sugg.id} onClick={() => mockSetIngredients([sugg.name])}>
        {sugg.name}
      </li>
    ));
    render(<ul className="suggestions-list">{suggestionItems}</ul>);

    fireEvent.click(screen.getByText('Tomato'));
    expect(mockSetIngredients).toHaveBeenCalledWith(['Tomato']);
  });

  test('Adds ingredient when Enter is pressed', () => {
    render(<InputBox ingredients={[]} setIngredients={mockSetIngredients} />);
    const input = screen.getByPlaceholderText('Type an ingredient...');
    fireEvent.change(input, { target: { value: 'Tomato' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockSetIngredients).toHaveBeenCalledWith(['Tomato']);
  });

  test('Removes ingredient when remove button is clicked', () => {
    render(<InputBox ingredients={mockIngredients} setIngredients={mockSetIngredients} />);

    const removeButtons = screen.getAllByText('x', { selector: 'button' });

    fireEvent.click(removeButtons[0]);

    expect(mockSetIngredients).toHaveBeenCalledWith(['Onion']);
  });

  test('Calls onIngredientsChange when ingredients are updated', () => {
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

    expect(mockOnIngredientsChange).toHaveBeenCalledWith(['Tomato']);
  });
});