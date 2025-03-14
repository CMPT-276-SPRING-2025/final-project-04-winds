import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the component to be tested
import TTS from '../Title_Card/TTS';

// Describe block to group related tests
describe('TTS', () => {
  // Basic test case to check if the component renders without crashing
  it('renders without crashing', () => {
    render(<TTS />);
  });

  // Test case to check if a specific element is present in the component
  it('renders the correct content', () => {
    render(<TTS />);
    
    // Example: Check if a specific text is present in the component
    expect(screen.getByTestId('text-to-speech')).toBeInTheDocument();
  });

  // Test case to check if a specific class is applied
  it('applies the correct class name', () => {
    render(<TTS className='languageBox' />);
    
    // Example: Check if the component has the correct class
    expect(screen.getByTestId('text-to-speech')).toHaveClass('languageBox');
  });
});