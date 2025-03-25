// googleAPIs.js
import { SpeechClient } from '@google-cloud/speech';
import { Translate } from '@google-cloud/translate-v2';
import textToSpeech from '@google-cloud/text-to-speech';

// Initialize clients
const speechClient = new SpeechClient({
    keyFilename: process.env.REACT_APP_GOOGLE_CLOUD_STT_CREDENTIALS
  });
  
  const translateClient = new Translate({
    key: process.env.REACT_APP_GOOGLE_CLOUD_API_KEY
  });
  
  const ttsClient = new textToSpeech.TextToSpeechClient({
    keyFilename: process.env.REACT_APP_GOOGLE_CLOUD_TTS_CREDENTIALS
  });


  export const synthesizeSpeech = async (text, languageCode = 'en-US', voiceName = 'en-US-Wavenet-D') => {
    const request = {
      input: { text },
      voice: {
        languageCode,
        name: voiceName,
      },
      audioConfig: { audioEncoding: 'MP3' },
    };
  
    const [response] = await ttsClient.synthesizeSpeech(request);
    return response.audioContent;
  };