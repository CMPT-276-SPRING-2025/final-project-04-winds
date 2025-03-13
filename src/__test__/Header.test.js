import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the component to be tested
import Header from '../Title_Card/Header';

// Describe block to group related tests
describe('Header', () => {
  // Basic test case to check if the component renders without crashing
  it('renders without crashing', () => {
    render(<Header />);
  });

  // Test case to check if a specific element is present in the component
  it('renders the correct content', () => {
    render(<Header />);
    
    expect(screen.getByText('CookCompass')).toBeInTheDocument();
  });

  // Test case to check if a specific class is applied
  it('applies the correct class name to tile', () => {
    render(<Header className="title" />);
    
    expect(screen.getByTestId('title')).toHaveClass('title');
  });

  // Test case to check if a specific class is applied
  it('applies the correct class name to header', () => {
    render(<Header className="header" />);
    
    expect(screen.getByTestId('header')).toHaveClass('header');
  });
});