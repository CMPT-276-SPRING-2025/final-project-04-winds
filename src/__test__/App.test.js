import { render, screen } from '@testing-library/react';
import App from '../App';

jest.mock('../GlobalStyle', () => () => <div data-testid="global-style"></div>);
jest.mock('../Ingredient_Box/IngredientsBox', () => () => <div data-testid="ingredients-box"></div>);
jest.mock('../Recipe_Box/RecipeBox', () => () => <div data-testid="recipe-box"></div>);
jest.mock('../Title_Card/Header', () => () => <div data-testid="header"></div>);
jest.mock('../Title_Card/TranslateBox', () => () => <div data-testid="translate-box"></div>);
jest.mock('../Title_Card/TTS', () => () => <div data-testid="tts"></div>);

describe('App Component', () => {
  test('All App Components are loaded', () => {
    render(<App />);

    expect(screen.getByTestId('global-style')).toBeInTheDocument();
    expect(screen.getByTestId('ingredients-box')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-box')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('translate-box')).toBeInTheDocument();
    expect(screen.getByTestId('tts')).toBeInTheDocument();
  });

  test('Logo image is in the page and is the first child of the header container', () => {
    const { container } = render(<App />);

    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/Media/Logo.gif');

    const headerContainer = container.querySelector('.container');
    expect(headerContainer).toBeInTheDocument();

    expect(headerContainer.firstChild).toBe(logo);
  });
});