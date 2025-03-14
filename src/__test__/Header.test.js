import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import Header from '../Title_Card/Header';

describe('Header', () => {
  test('Renders without crashing', () => {
    render(<Header />);
  });

  test('Renders the title', () => {
    render(<Header />);
    
    expect(screen.getByText('CookCompass')).toBeInTheDocument();
  });

  test('Applies the correct styling to tile', () => {
    render(<Header className="title" />);
    
    expect(screen.getByTestId('title')).toHaveClass('title');
  });

  test('Applies the correct styling to header', () => {
    render(<Header className="header" />);
    
    expect(screen.getByTestId('header')).toHaveClass('header');
  });
});