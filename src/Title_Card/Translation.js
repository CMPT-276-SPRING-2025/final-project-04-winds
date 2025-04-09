//  translation for recipe instructions
const Translation = {
    // handle translation for detailed recipe instructions (step-by-step format) to selected language
    // analyzedInstructions - Array of instruction objects with steps
    // targetLanguage - language code to translate to (e.g. 'es')
    // returns translated instructions in same format as input (array)
    async detailedInstructions(analyzedInstructions, targetLanguage, showErrorModal) {
        const API_KEY = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;
        try {
            // return original instructions if there are no instructions or language 
            if (!analyzedInstructions || !targetLanguage)  {
                return analyzedInstructions;
            }

            // combine steps into single string -> 1 api call
            const stepsText = analyzedInstructions[0].steps
                .map(step => step.step) // Extract step text
                .join('\n\n'); // Separate steps with double newlines

            // request translation from Google Cloud Translate API
            let response;
            try {
                response = await fetch(
                    `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
                    {
                        method:'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            q: stepsText,
                            target: targetLanguage, // language code
                            format: 'text'
                        })
                    }
                );
            } catch (_) {
                // network error - prevent console noise and show modal
                if (showErrorModal) {
                    showErrorModal({
                        context: 'Translation Error',
                        message: 'Network error occurred while translating recipe instructions.'
                    });
                }
                return analyzedInstructions;
            }

            // handle API errors (e.g. 403 Forbidden)
            if (!response || !response.ok) {
                const errorMessage = `Translation failed with status ${response?.status || 'unknown'}. Translation was spammed to much too fast.`;
                if (showErrorModal) {
                    showErrorModal({
                        context: 'Translation Error',
                        message: errorMessage,
                    });
                }
                return analyzedInstructions;
            }

            // process translated text for step by step display
            const data = await response.json();
            // retrieve and split the translated text back into individual steps
            const translatedText = data.data.translations[0].translatedText;
            const translatedStepsArray = translatedText.split('\n\n');
            // create deep copy of original instructions
            const translatedInstructions = JSON.parse(JSON.stringify(analyzedInstructions));
            translatedInstructions[0].steps.forEach((step, index) => {
                // map translated steps to original instructions with steps
                // if translated steps are missing, use original steps
                step.step = translatedStepsArray[index] || step.step;
            });

            return translatedInstructions;
        } catch(error){
            // error handling: return original recipe if translation fails
            if (showErrorModal) {
                showErrorModal({context:`Translation error 3: ${error.message}`, message: error.message});
            }
            return analyzedInstructions;
        }
    },

    // handle translation of HTML formatted regular instructions
    // instructions - HTML string of instructions
    // targetLanguage - language code to translate to
    // returns translated instructions in HTML format
    async regularInstructions(instructions, targetLanguage, showErrorModal) {
        const API_KEY = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;

        try {
            // return original if no instructions
            if (!instructions) return instructions;

            // extract text from html for translation
            const textInstructions = instructions
                .replace(/<li>/g, '\n') //replace list items with newlines
                .replace(/<\/?[^>]+(>|$)/g, ''); //remove HTML tags

            // API call to google cloud translate API
            let response;
            try {
                response = await fetch(
                    `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            q: textInstructions,
                            target: targetLanguage,
                            format: 'text'
                        })
                    }
                );
            } catch (_) {
                // network error - prevent console noise and show modal
                if (showErrorModal) {
                    showErrorModal({
                        context: 'Translation Error',
                        message: 'Network error occurred while translating instructions.'
                    });
                }
                return instructions;
            }

            // handle API errors (e.g. 403 Forbidden)
            if (!response || !response.ok) {
                const errorMessage = `Translation failed with status ${response?.status || 'unknown'}. The Translation was spammed too much to fast.`;
                if (showErrorModal) {
                    showErrorModal({
                        context: 'Translation Error',
                        message: errorMessage,
                    });
                }
                return instructions;
            }

            // convert translated text back to HTML format for display
            const data = await response.json();
            let translatedText = data.data.translations[0].translatedText;

            // convert translated text back to HTML list format
            const htmlOutput = translatedText
                .replace(/\[\[LIST_ITEM\]\]/g, '</li><li>')  // Convert markers to list items
                .replace(/^/, '<ol><li>')                    // Add opening tags
                .replace(/$/, '</li></ol>');                 // Add closing tags

            return htmlOutput;

        } catch(error){
            // error handling: return original recipe if translation fails
            if (showErrorModal) {
                showErrorModal({context:`Translation error 4: ${error.message}`, message: error.message});
            }
            return instructions;
        }
    }
};

export default Translation;
