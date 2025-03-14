import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the component to be tested
import TranslateBox from '../Title_Card/TranslateBox';

// Describe block to group related tests
describe('TranslateBox', () => {
  // Basic test case to check if the component renders without crashing
  it('renders without crashing', () => {
    render(<TranslateBox />);
  });

  // Test case to check if a specific element is present in the component
  it('renders the correct content', () => {
    render(<TranslateBox />);
    
    // Example: Check if a specific text is present in the component
    expect(screen.getByTestId('translate')).toBeInTheDocument();
  });

  // Test case to check if a specific class is applied
  it('applies the correct class name', () => {
    render(<TranslateBox className='languageBox' />);
    
    // Example: Check if the component has the correct class
    expect(screen.getByTestId('translate')).toHaveClass('languageBox');
  });
});