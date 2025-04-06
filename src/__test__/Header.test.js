import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested - Header component from Title Card feature
import Header from '../Title_Card/Header';

describe('Header Component', () => {
  // Basic rendering test
  test('Renders without crashing', () => {
    // Verify the component mounts successfully with no errors
    render(<Header />);
  });

  // Content verification test
  test('Renders the title', () => {
    render(<Header />);
    
    // Verify the main title text "CookCompass" is displayed
    expect(screen.getByText('CookCompass')).toBeInTheDocument();
  });

  // Styling tests
  describe('Styling Verification', () => {
    test('Applies the correct styling to title', () => {
      // Render with specific className for title
      render(<Header className="title" />);
      
      // Verify the title element has the expected class
      expect(screen.getByTestId('title')).toHaveClass('title');
    });

    test('Applies the correct styling to header', () => {
      // Render with specific className for header
      render(<Header className="header" />);
      
      // Verify the header container has the expected class
      expect(screen.getByTestId('header')).toHaveClass('header');
    });
  });
});