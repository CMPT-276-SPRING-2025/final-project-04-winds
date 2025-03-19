
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import IngredientsBox from '../Ingredient_Box/IngredientsBox';

// Simplified version of input box
jest.mock('../Ingredient_Box/InputBox', () => () => <div data-testid="input-box"></div>);


describe('IngredientsBox', () => {
  // mock props
  const mockIngredients = [];
  const mockSetIngredients = jest.fn();
  const mockOnSearch = jest.fn();


  test('Renders without crashing', () => {
    render(<IngredientsBox />)
  });

  test('Renders the green box', () => {
    render(<IngredientsBox />)
    expect(screen.getByTestId('green-box')).toBeInTheDocument()
  });

  test('Applies the correct styling to the green box', () => {
    render(<IngredientsBox className="green-box" />)
    expect(screen.getByTestId('green-box')).toHaveClass('green-box')
  });

  test('All InputBoxes are loaded', () => {
    render(<IngredientsBox/>)
    expect(screen.getByTestId('input-box')).toBeInTheDocument()
  });

  test('Passes ingredients and set ingredients props to Input Box', () => {
    render(<IngredientsBox
              ingredients={mockIngredients}
              setIngredients={mockSetIngredients}
            />)
    expect(screen.getByTestId('input-box')).toBeInTheDocument()
  });

  test('Renders the \'Get Cooking\' button', () => {
    render(<IngredientsBox/>)
    expect(screen.getByRole('button', {name: /get cooking!/i })).toBeInTheDocument()
  });

  test('Correct stylings applied to the \'Get Cooking\' button', () => {
    render(<IngredientsBox/>)
    const button = screen.getByRole('button', {name: /get cooking!/i })
    expect(button).toHaveClass('search-button')
  });

  test('Calls onSearch when the button is called', () => {
    render(<IngredientsBox onSearch={mockOnSearch}/>)
    const button = screen.getByRole('button', {name: /get cooking!/i })
    fireEvent.click(button)
    expect(mockOnSearch).toHaveBeenCalledTimes(1)
  });
  
  test('Doesn\'t give an error on search isn\'t provided', () => {
    render(<IngredientsBox/>)
    const button = screen.getByRole('button', {name: /get cooking!/i })    
    expect(() => fireEvent.click(button)).not.toThrow()
  });

  test('Renders properly with empty ingredients', () => {
    render(<IngredientsBox ingredients={[]}/>)
    expect(screen.getByTestId('green-box')).toBeInTheDocument()
  });

  test('Renders properly with null ingredients', () => {
    render(<IngredientsBox ingredients={[null]}/>)
    expect(screen.getByTestId('green-box')).toBeInTheDocument()
  });
});