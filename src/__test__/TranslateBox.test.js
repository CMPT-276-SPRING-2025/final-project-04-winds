import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Languages from '../data/Languages';

// Component to be tested
import TranslateBox from '../Title_Card/TranslateBox';

describe('TranslateBox Component', () => {
  // Mock functions for testing language selection callbacks
  const mockSetSelectedLanguageIn = jest.fn();
  const mockSetSelectedLanguageOut = jest.fn();
  
  // Default props to use in most test cases
  const defaultProps = {
    selectedLanguageIn: 'en',         // Default input language (English)
    selectedLanguageOut: 'es',        // Default output language (Spanish)
    setSelectedLanguageIn: mockSetSelectedLanguageIn,
    setSelectedLanguageOut: mockSetSelectedLanguageOut
  };

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic rendering tests
  describe('Basic Rendering', () => {
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
  });

  // Menu behavior tests
  describe('Menu Behavior', () => {
    test('Menu is initially closed', () => {
      render(<TranslateBox {...defaultProps} />);
      
      // Verify no language options are visible initially
      expect(screen.queryByText('English')).not.toBeInTheDocument();
      expect(screen.queryByText('Spanish')).not.toBeInTheDocument();
    });

    test('Menu opens when clicking translate button', () => {
      render(<TranslateBox {...defaultProps} />);
      
      // Find and click the translate button
      const translateButton = screen.getByTestId('translate').closest('button');
      fireEvent.click(translateButton);
      
      // Check if language selection options appear
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
      
      // Click outside the component
      fireEvent.mouseDown(screen.getByTestId('outside-element'));
      
      // Wait for and verify the menu closes
      await waitFor(() => {
        expect(screen.queryByText('English')).not.toBeInTheDocument();
      });
    });

    test('Button has active class when menu is open', () => {
      render(<TranslateBox {...defaultProps} />);
      
      const translateButton = screen.getByTestId('translate').closest('button');
      
      // Verify button starts inactive
      expect(translateButton).not.toHaveClass('active');
      
      // Click to open menu
      fireEvent.click(translateButton);
      
      // Verify button becomes active
      expect(translateButton).toHaveClass('active');
    });
  });

  // Language dropdown tests
  describe('Language Dropdown', () => {
    test('Language dropdown is initially closed', () => {
      render(<TranslateBox {...defaultProps} />);
      
      // Open main menu first
      const translateButton = screen.getByTestId('translate').closest('button');
      fireEvent.click(translateButton);
      
      // Verify language list is not visible initially
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    test('Language dropdown opens when clicking on the output language', () => {
      render(<TranslateBox {...defaultProps} />);
      
      // Open main menu
      const translateButton = screen.getByTestId('translate').closest('button');
      fireEvent.click(translateButton);
      
      // Click on output language to open dropdown
      fireEvent.click(screen.getByText('Spanish'));
      
      // Verify language list appears
      expect(screen.getByRole('list')).toBeInTheDocument();
      
      // Verify all languages from Languages data are rendered
      Languages.forEach(lang => {
        expect(screen.queryAllByText(lang.name)[0]).toBeInTheDocument();
      });
    });

    test('Selecting a language updates the output language', () => {
      render(<TranslateBox {...defaultProps} />);
      
      // Open main menu
      const translateButton = screen.getByTestId('translate').closest('button');
      fireEvent.click(translateButton);
      
      // Open language dropdown
      fireEvent.click(screen.getByText('Spanish'));
      
      // Select French option
      const frenchOption = screen.getByText('French');
      fireEvent.click(frenchOption);
      
      // Verify the setter was called with French language code
      expect(mockSetSelectedLanguageOut).toHaveBeenCalledWith('fr');
    });

    test('Selected language has "selected" class', () => {
      render(<TranslateBox {...defaultProps} />);
      
      // Open main menu
      const translateButton = screen.getByTestId('translate').closest('button');
      fireEvent.click(translateButton);
      
      // Open dropdown
      fireEvent.click(screen.getByText(/Spanish/i));
      
      // Verify the selected language has the correct class
      const selectedLanguageItem = screen.queryAllByText(/Spanish/i)[1].closest('li');
      expect(selectedLanguageItem).toHaveClass('selected');
    });

    test('Arrow image changes when dropdown is toggled', () => {
      render(<TranslateBox {...defaultProps} />);
      
      // Open main menu
      const translateButton = screen.getByTestId('translate').closest('button');
      fireEvent.click(translateButton);
      
      // Verify down arrow is shown initially
      expect(screen.queryAllByAltText('Arrow')[0].getAttribute('src')).toBe('/Media/Arrow.png');
      
      // Open dropdown
      fireEvent.click(screen.getByText('Spanish'));
      
      // Verify up arrow is shown when dropdown is open
      expect(screen.queryAllByAltText('Arrow')[1].getAttribute('src')).toBe('/Media/arrowDown.png');
    });
  });

  // Edge case tests
  describe('Edge Cases', () => {
    test('Displays "Unknown" for invalid language codes', () => {
      // Test with an invalid language code
      const propsWithInvalidCode = {
        ...defaultProps,
        selectedLanguageOut: 'invalid_code'
      };
      
      render(<TranslateBox {...propsWithInvalidCode} />);
      
      // Open menu
      const translateButton = screen.getByTestId('translate').closest('button');
      fireEvent.click(translateButton);
      
      // Verify "Unknown" is displayed for invalid code
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });
});