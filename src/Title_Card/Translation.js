
const Translation = async (analyzedInstructions, targetLanguage) => {
    const API_KEY = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;
    try {
        console.log("Attempting translation...");
        if (!analyzedInstructions || !targetLanguage)  {
            console.error("Missing parameters:", { analyzedInstructions, targetLanguage });
            return analyzedInstructions;
          }

        // combine steps into single string - 1 api call
        const stepsText = analyzedInstructions[0].steps
        .map(step => step.step)
        .join('\n\n');

        const requestBody = {
            q: stepsText,
            target: targetLanguage,
            format: 'text'
        };
        
        console.log("Request payload:", JSON.stringify(requestBody, null, 2));

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
};

export default Translation;