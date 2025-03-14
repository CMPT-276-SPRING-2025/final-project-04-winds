import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import TranslateBox from '../Title_Card/TranslateBox';

describe('TranslateBox', () => {
  test('Renders without crashing', () => {
    render(<TranslateBox />);
  });

  test('Renders the translation icon', () => {
    render(<TranslateBox />);
    
    const translate = screen.getByTestId('translate');
    expect(translate).toBeInTheDocument();
    expect(translate).toHaveAttribute('src', '/Media/Translate.png')
  });

  test('Applies the correct styling', () => {
    render(<TranslateBox className='languageBox' />);
    
    expect(screen.getByTestId('translate')).toHaveClass('languageBox');
  });
});