import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import TTS from '../Title_Card/TTS';

describe('TTS', () => {
  test('Renders without crashing', () => {
    render(<TTS />);
  });

  test('Renders the TTS Icon', () => {
    render(<TTS />);
    
    const ttsIcon = screen.getByTestId('text-to-speech');
    expect(ttsIcon).toBeInTheDocument();
    expect(ttsIcon).toHaveAttribute('src', '/Media/Text-To-Speech.png')
  });

  test('applies the correct styling to the TTS', () => {
    render(<TTS className='languageBox' />);
    
    expect(screen.getByTestId('text-to-speech')).toHaveClass('languageBox');
  });
});