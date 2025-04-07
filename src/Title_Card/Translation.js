//  translation for recipe instructions
const Translation = {
    // handle translation for detailed recipe instructions (step-by-step format) to selected language
    // analyzedInstructions - Array of instruction objects with steps
    // targetLanguage - language code to translate to (e.g. 'es')
    // returns translated instructions in same format as input (array)
    async detailedInstructions(analyzedInstructions, targetLanguage){
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
            const response = await fetch(
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
            // handle API errors
            if (!response.ok) {
                await response.json().catch(() => ({}));
                throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
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
            showErrorModal({context:`Translation error 3: ${error.message}`, message: error.message});
            return analyzedInstructions;
        }
    },

    // handle translation of HTML formatted regular instructions
    // instructions - HTML string of instructions
    // targetLanguage - language code to translate to
    // returns translated instructions in HTML format
    async regularInstructions(instructions, targetLanguage){
        const API_KEY = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;
        
        try{
            // return original if no instructions
            if(!instructions) return instructions;

            // extract text from html for translation
            const textInstructions = instructions
                .replace(/<li>/g, '\n') //replace list items with newlines
                .replace(/<\/?[^>]+(>|$)/g, ''); //remove HTML tags

            // API call to google cloud translate API
            const response = await fetch(
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
            showErrorModal({context:`Translation error 4: ${error.message}`, message: error.message});
            return instructions;
        }
        
    }
};
 

export default Translation;