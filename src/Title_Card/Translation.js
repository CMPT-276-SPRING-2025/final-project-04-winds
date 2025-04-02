
const Translation = {
    async detailedInstructions(analyzedInstructions, targetLanguage){
        const API_KEY = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;
        try {
            if (!analyzedInstructions || !targetLanguage)  {
                console.error("Missing parameters:", { analyzedInstructions, targetLanguage });
                return analyzedInstructions;
            }

            // combine steps into single string - 1 api call
            const stepsText = analyzedInstructions[0].steps
            .map(step => step.step)
            .join('\n\n');

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

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error Details:', errorData);
                throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            // retrieve and split the translated text back into individual steps
            const translatedText = data.data.translations[0].translatedText;
            const translatedStepsArray = translatedText.split('\n\n');
            const translatedInstructions = JSON.parse(JSON.stringify(analyzedInstructions));
            translatedInstructions[0].steps.forEach((step, index) => {
                // map translation to original 
                step.step = translatedStepsArray[index] || step.step;
            });

            return translatedInstructions;
        } catch(error){
            // error handling: return original recipe if translation fails
            console.error('Translation error:', error);
            return analyzedInstructions;
        }
    },

    // handle html format of regular instructions
    async regularInstructions(instructions, targetLanguage){
        const API_KEY = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;
        
        try{
            if(!instructions) return instructions;

            // extract text from html 
            const textInstructions = instructions
                .replace(/<li>/g, '\n')
                .replace(/<\/?[^>]+(>|$)/g, '');

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

            const data = await response.json();
            let translatedText = data.data.translations[0].translatedText;

            const htmlOutput = translatedText
            .replace(/\[\[LIST_ITEM\]\]/g, '</li><li>')  // Convert markers
            .replace(/^/, '<ol><li>')                    // Add opening tags
            .replace(/$/, '</li></ol>');                 // Add closing tags

            return htmlOutput;

        } catch(error){
            // error handling: return original recipe if translation fails
            console.error('Translation error:', error);
            return instructions;
        }
        
    }
};
 

export default Translation;