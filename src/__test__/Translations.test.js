import Translation from '../Title_Card/Translation';

// Mock fetch API
global.fetch = jest.fn();



describe('Translation', () => {
  // Setup and teardown
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_GOOGLE_CLOUD_API_KEY = 'test-api-key';
  });

  describe('detailedInstructions', () => {
    // Successful translation test
    test('should translate detailed instructions successfully', async () => {
      // Mock data
      const analyzedInstructions = [
        {
          steps: [
            { step: 'Step 1: Mix ingredients' },
            { step: 'Step 2: Cook for 20 minutes' }
          ]
        }
      ];
      
      // Mock successful API response
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
      
      // Verify the API was called correctly
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
      
      // Verify the result
      expect(result).toEqual([
        {
          steps: [
            { step: 'Étape 1: Mélanger les ingrédients' },
            { step: 'Étape 2: Cuire pendant 20 minutes' }
          ]
        }
      ]);
    });

    // Missing parameter tests
    test('should return original data when analyzedInstructions is missing', async () => {
      const result = await Translation.detailedInstructions(null, 'fr');
      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should return original data when targetLanguage is missing', async () => {
      const analyzedInstructions = [{ steps: [{ step: 'Test step' }] }];
      const result = await Translation.detailedInstructions(analyzedInstructions, null);
      expect(result).toEqual(analyzedInstructions);
      expect(fetch).not.toHaveBeenCalled();
    });

    // API error handling tests
    /*
    test('should handle API errors gracefully', async () => {
      const analyzedInstructions = [{ steps: [{ step: 'Test step' }] }];
      
      // Mock failed API response
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: { message: 'Invalid request' } })
      });

      const result = await Translation.detailedInstructions(analyzedInstructions, 'fr');
      
      expect(fetch).toHaveBeenCalled();
      expect(result).toEqual(analyzedInstructions); // Should return original on error
    });

    test('should handle network errors gracefully', async () => {
      const analyzedInstructions = [{ steps: [{ step: 'Test step' }] }];
      
      // Mock network error
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await Translation.detailedInstructions(analyzedInstructions, 'fr');
      
      expect(fetch).toHaveBeenCalled();
      expect(result).toEqual(analyzedInstructions); // Should return original on error
    });*/

    // Edge case: Empty steps array
    test('should handle empty steps array', async () => {
      const analyzedInstructions = [{ steps: [] }];
      
      // Mock successful API response
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
      
      expect(fetch).toHaveBeenCalled();
      expect(result).toEqual([{ steps: [] }]);
    });

    // Edge case: Split count mismatch
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
      
      // Third step should keep original text
      expect(result[0].steps[0].step).toBe('Étape 1: Mélanger les ingrédients');
      expect(result[0].steps[1].step).toBe('Étape 2: Cuire pendant 20 minutes');
      expect(result[0].steps[2].step).toBe('Step 3: Serve hot');
    });
  });

  describe('regularInstructions', () => {
    // Successful translation test
    test('should translate regular HTML instructions successfully', async () => {
      const instructions = '<ol><li>Preheat oven to 350°F</li><li>Bake for 20 minutes</li></ol>';
      
      // Mock successful API response
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
      
      // Verify the API was called correctly
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
      
      // Verify result has proper HTML format
      expect(result).toBe('<ol><li>\nPrecalentar el horno a 350°F\nHornear durante 20 minutos</li></ol>');
    });

    // Missing parameter test
    test('should return original instructions when instructions are missing', async () => {
      const result = await Translation.regularInstructions(null, 'es');
      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    // API error handling test
    /*
    test('should handle API errors gracefully for regularInstructions', async () => {
      const instructions = '<ol><li>Test instruction</li></ol>';
      
      // Mock failed API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Parsing error'); }
      });

      const result = await Translation.regularInstructions(instructions, 'es');
      
      expect(fetch).toHaveBeenCalled();
      expect(result).toEqual(instructions); // Should return original on error
    });*/

    // Edge case: Empty HTML
    test('should handle empty HTML instructions', async () => {
      const instructions = '<ol></ol>';
      
      // Mock successful API response
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
      
      expect(fetch).toHaveBeenCalled();
      expect(result).toBe('<ol><li></li></ol>');
    });

    // Edge case: Complex HTML
    test('should handle complex HTML structure', async () => {
      const instructions = '<ol><li>Step <b>one</b></li><li>Step <i>two</i> with <a href="#">link</a></li></ol>';
      
      // Mock successful API response
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
      
      expect(fetch).toHaveBeenCalled();
      expect(result).toBe('<ol><li>\nPaso uno\nPaso dos con enlace</li></ol>');
    });
  });

  // Implementation tests
  describe('Implementation details', () => {
    test('should use the correct API endpoint', async () => {
      const analyzedInstructions = [{ steps: [{ step: 'Test step' }] }];
      
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
      
      expect(fetch).toHaveBeenCalledWith(
        `https://translation.googleapis.com/language/translate/v2?key=test-api-key`,
        expect.anything()
      );
    });

    test('should handle missing environment variable', async () => {
      // Clear the environment variable
      delete process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;
      
      const analyzedInstructions = [{ steps: [{ step: 'Test step' }] }];
      
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
      
      // Should call API with undefined key
      expect(fetch).toHaveBeenCalledWith(
        'https://translation.googleapis.com/language/translate/v2?key=undefined',
        expect.anything()
      );
    });
  });
});