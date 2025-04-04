import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Languages from '../data/Languages';

// Component to be tested
import TranslateBox from '../Title_Card/TranslateBox';

describe('TranslateBox', () => {
  const mockSetSelectedLanguageIn = jest.fn();
  const mockSetSelectedLanguageOut = jest.fn();
  
  const defaultProps = {
    selectedLanguageIn: 'en',
    selectedLanguageOut: 'es',
    setSelectedLanguageIn: mockSetSelectedLanguageIn,
    setSelectedLanguageOut: mockSetSelectedLanguageOut
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Renders without crashing', () => {
    render(<TranslateBox {...defaultProps} />);
    expect(screen.getByTestId('translate')).toBeInTheDocument();
  });

  test('Renders the translation icon with correct attributes', () => {
    render(<TranslateBox {...defaultProps} />);
    
    const translate = screen.getByTestId('translate');
    expect(translate).toBeInTheDocument();
    expect(translate).toHaveAttribute('src', '/Media/Translate.png');
    expect(translate).toHaveAttribute('alt', 'Translate');
    expect(translate).toHaveClass('image-button');
  });

  test('Menu is initially closed', () => {
    render(<TranslateBox {...defaultProps} />);
    
    expect(screen.queryByText('English')).not.toBeInTheDocument();
    expect(screen.queryByText('Spanish')).not.toBeInTheDocument();
  });

  test('Menu opens when clicking translate button', () => {
    render(<TranslateBox {...defaultProps} />);
    
    const translateButton = screen.getByTestId('translate').closest('button');
    fireEvent.click(translateButton);
    
    // Check if language names are displayed in the menu
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
  });

  test('Menu closes when clicking outside', async () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <TranslateBox {...defaultProps} />
      </div>
    );
    
    // Open the menu first
    const translateButton = screen.getByTestId('translate').closest('button');
    fireEvent.click(translateButton);
    
    // Verify menu is open
    expect(screen.getByText('English')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    
    // Wait for the menu to close
    await waitFor(() => {
      expect(screen.queryByText('English')).not.toBeInTheDocument();
    });
  });

  test('Language dropdown is initially closed', () => {
    render(<TranslateBox {...defaultProps} />);
    
    const translateButton = screen.getByTestId('translate').closest('button');
    fireEvent.click(translateButton);
    
    // Language list should not be visible
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  test('Language dropdown opens when clicking on the output language', () => {
    render(<TranslateBox {...defaultProps} />);
    
    // Open menu first
    const translateButton = screen.getByTestId('translate').closest('button');
    fireEvent.click(translateButton);
    
    // Click on output language to open dropdown
    fireEvent.click(screen.getByText('Spanish'));
    
    // Language list should now be visible
    expect(screen.getByRole('list')).toBeInTheDocument();
    
    // Should see language options
    Languages.forEach(lang => {
      expect(screen.queryAllByText(lang.name)[0]).toBeInTheDocument();
    });
  });

  test('Selecting a language updates the output language', () => {
    render(<TranslateBox {...defaultProps} />);
    
    // Open menu first
    const translateButton = screen.getByTestId('translate').closest('button');
    fireEvent.click(translateButton);
    
    // Open dropdown
    fireEvent.click(screen.getByText('Spanish'));
    
    // Select French (assuming it exists in the Languages array)
    const frenchOption = screen.getByText('French');
    fireEvent.click(frenchOption);
    
    // Check if the setter function was called with the right code
    expect(mockSetSelectedLanguageOut).toHaveBeenCalledWith('fr');
  });

  test('Displays "Unknown" for invalid language codes', () => {
    const propsWithInvalidCode = {
      ...defaultProps,
      selectedLanguageOut: 'invalid_code'
    };
    
    render(<TranslateBox {...propsWithInvalidCode} />);
    
    const translateButton = screen.getByTestId('translate').closest('button');
    fireEvent.click(translateButton);
    
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  test('Arrow image changes when dropdown is toggled', () => {
    render(<TranslateBox {...defaultProps} />);
    
    // Open menu first
    const translateButton = screen.getByTestId('translate').closest('button');
    fireEvent.click(translateButton);
    
    // Initially should show down arrow
    expect(screen.queryAllByAltText('Arrow')[0].getAttribute('src')).toBe('/Media/Arrow.png');
    
    // Open dropdown
    fireEvent.click(screen.getByText('Spanish'));
    
    // Should now show up arrow
    expect(screen.queryAllByAltText('Arrow')[1].getAttribute('src')).toBe('/Media/arrowDown.png');
  });

  test('Selected language has "selected" class', () => {
    render(<TranslateBox {...defaultProps} />);
    
    // Open menu first
    const translateButton = screen.getByTestId('translate').closest('button');
    fireEvent.click(translateButton);
    
    // Open dropdown
    fireEvent.click(screen.getByText(/Spanish/i));
    
    // Find the li element containing "Spanish" and check if it has the selected class
    const selectedLanguageItem = screen.queryAllByText(/Spanish/i)[1].closest('li');
    expect(selectedLanguageItem).toHaveClass('selected');
  });

  test('Button has active class when menu is open', () => {
    render(<TranslateBox {...defaultProps} />);
    
    const translateButton = screen.getByTestId('translate').closest('button');
    
    // Initially should not have active class
    expect(translateButton).not.toHaveClass('active');
    
    // Click to open menu
    fireEvent.click(translateButton);
    
    // Should now have active class
    expect(translateButton).toHaveClass('active');
  });
});