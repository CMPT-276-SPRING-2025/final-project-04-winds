// Import the Translation module to be tested
import Translation from '../Title_Card/Translation';

// Mock the global fetch API for all tests
global.fetch = jest.fn();

describe('Translation', () => {
  // Setup and teardown for each test
  beforeEach(() => {
    // Clear all mock calls and instances before each test
    jest.clearAllMocks();
    // Set up test API key
    process.env.REACT_APP_GOOGLE_CLOUD_API_KEY = 'test-api-key';
  });

  // Test suite for detailedInstructions method
  describe('detailedInstructions', () => {
    // Test successful translation scenario
    test('should translate detailed instructions successfully', async () => {
      // Mock input data with cooking steps
      const analyzedInstructions = [
        {
          steps: [
            { step: 'Step 1: Mix ingredients' },
            { step: 'Step 2: Cook for 20 minutes' }
          ]
        }
      ];
      
      // Mock successful API response with French translation
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            translations: [
              { translatedText: 'Étape 1: Mélanger les ingrédients\n\nÉtape 2: Cuire pendant 20 minutes' }
            ]
          }
        })
      });

      // Call the method being tested
      const result = await Translation.detailedInstructions(analyzedInstructions, 'fr');
      
      // Verify the API was called with correct parameters
      expect(fetch).toHaveBeenCalledWith(
        `https://translation.googleapis.com/language/translate/v2?key=test-api-key`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            q: 'Step 1: Mix ingredients\n\nStep 2: Cook for 20 minutes',
            target: 'fr',
            format: 'text'
          })
        })
      );
      
      // Verify the translated result matches expected format
      expect(result).toEqual([
        {
          steps: [
            { step: 'Étape 1: Mélanger les ingrédients' },
            { step: 'Étape 2: Cuire pendant 20 minutes' }
          ]
        }
      ]);
    });

    // Test missing parameters scenarios
    test('should return original data when analyzedInstructions is missing', async () => {
      const result = await Translation.detailedInstructions(null, 'fr');
      expect(result).toBeNull();
      // Verify no API call was made
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should return original data when targetLanguage is missing', async () => {
      const analyzedInstructions = [{ steps: [{ step: 'Test step' }] }];
      const result = await Translation.detailedInstructions(analyzedInstructions, null);
      expect(result).toEqual(analyzedInstructions);
      // Verify no API call was made
      expect(fetch).not.toHaveBeenCalled();
    });

    // Test edge case: Empty steps array
    test('should handle empty steps array', async () => {
      const analyzedInstructions = [{ steps: [] }];
      
      // Mock successful API response with empty translation
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            translations: [
              { translatedText: '' }
            ]
          }
        })
      });

      const result = await Translation.detailedInstructions(analyzedInstructions, 'fr');
      
      // Verify API was called but returns empty steps
      expect(fetch).toHaveBeenCalled();
      expect(result).toEqual([{ steps: [] }]);
    });

    // Test edge case: Split count mismatch between original and translated steps
    test('should handle translation split count not matching original steps count', async () => {
      const analyzedInstructions = [
        {
          steps: [
            { step: 'Step 1: Mix ingredients' },
            { step: 'Step 2: Cook for 20 minutes' },
            { step: 'Step 3: Serve hot' }
          ]
        }
      ];
      
      // Mock API response with fewer splits than expected
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            translations: [
              { translatedText: 'Étape 1: Mélanger les ingrédients\n\nÉtape 2: Cuire pendant 20 minutes' }
            ]
          }
        })
      });

      const result = await Translation.detailedInstructions(analyzedInstructions, 'fr');
      
      // Verify first two steps are translated, third remains original
      expect(result[0].steps[0].step).toBe('Étape 1: Mélanger les ingrédients');
      expect(result[0].steps[1].step).toBe('Étape 2: Cuire pendant 20 minutes');
      expect(result[0].steps[2].step).toBe('Step 3: Serve hot');
    });
  });

  // Test suite for regularInstructions method
  describe('regularInstructions', () => {
    // Test successful HTML instructions translation
    test('should translate regular HTML instructions successfully', async () => {
      const instructions = '<ol><li>Preheat oven to 350°F</li><li>Bake for 20 minutes</li></ol>';
      
      // Mock successful API response with Spanish translation
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            translations: [
              { translatedText: '\nPrecalentar el horno a 350°F\nHornear durante 20 minutos' }
            ]
          }
        })
      });

      const result = await Translation.regularInstructions(instructions, 'es');
      
      // Verify API call with correct parameters
      expect(fetch).toHaveBeenCalledWith(
        `https://translation.googleapis.com/language/translate/v2?key=test-api-key`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            q: '\nPreheat oven to 350°F\nBake for 20 minutes',
            target: 'es',
            format: 'text'
          })
        })
      );
      
      // Verify result maintains HTML structure with translated content
      expect(result).toBe('<ol><li>\nPrecalentar el horno a 350°F\nHornear durante 20 minutos</li></ol>');
    });

    // Test missing parameters scenario
    test('should return original instructions when instructions are missing', async () => {
      const result = await Translation.regularInstructions(null, 'es');
      expect(result).toBeNull();
      // Verify no API call was made
      expect(fetch).not.toHaveBeenCalled();
    });

    // Test edge case: Empty HTML instructions
    test('should handle empty HTML instructions', async () => {
      const instructions = '<ol></ol>';
      
      // Mock successful API response with empty translation
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            translations: [
              { translatedText: '' }
            ]
          }
        })
      });

      const result = await Translation.regularInstructions(instructions, 'es');
      
      // Verify API was called but returns empty list item
      expect(fetch).toHaveBeenCalled();
      expect(result).toBe('<ol><li></li></ol>');
    });

    // Test edge case: Complex HTML structure
    test('should handle complex HTML structure', async () => {
      const instructions = '<ol><li>Step <b>one</b></li><li>Step <i>two</i> with <a href="#">link</a></li></ol>';
      
      // Mock successful API response with Spanish translation
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            translations: [
              { translatedText: '\nPaso uno\nPaso dos con enlace' }
            ]
          }
        })
      });

      const result = await Translation.regularInstructions(instructions, 'es');
      
      // Verify API was called and HTML structure is preserved
      expect(fetch).toHaveBeenCalled();
      expect(result).toBe('<ol><li>\nPaso uno\nPaso dos con enlace</li></ol>');
    });
  });

  // Test suite for implementation details
  describe('Implementation details', () => {
    // Test correct API endpoint usage
    test('should use the correct API endpoint', async () => {
      const analyzedInstructions = [{ steps: [{ step: 'Test step' }] }];
      
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            translations: [
              { translatedText: 'Test step translated' }
            ]
          }
        })
      });

      await Translation.detailedInstructions(analyzedInstructions, 'fr');
      
      // Verify correct Google Translate API endpoint is called
      expect(fetch).toHaveBeenCalledWith(
        `https://translation.googleapis.com/language/translate/v2?key=test-api-key`,
        expect.anything()
      );
    });

    // Test handling of missing environment variable
    test('should handle missing environment variable', async () => {
      // Clear the environment variable for this test
      delete process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;
      
      const analyzedInstructions = [{ steps: [{ step: 'Test step' }] }];
      
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            translations: [
              { translatedText: 'Test step translated' }
            ]
          }
        })
      });

      await Translation.detailedInstructions(analyzedInstructions, 'fr');
      
      // Verify API is called with undefined key
      expect(fetch).toHaveBeenCalledWith(
        'https://translation.googleapis.com/language/translate/v2?key=undefined',
        expect.anything()
      );
    });
  });
});