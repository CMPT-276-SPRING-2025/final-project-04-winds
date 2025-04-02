import React, { useState, useEffect, useRef, useCallback } from 'react';
import './TranslateTTSBox.css';

const TTS = ({analyzedInstructions}) => {
  // ===== STATE MANAGEMENT =====
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [showCommands, setShowCommands] = useState(false);

  // ===== REFS =====
  const menuRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const lastCommandTime = useRef(0);
  const processingInterval = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);

  // ===== GOOGLE CLOUD CONFIG =====
  const API_KEY = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;
  const SPEECH_API_URL = `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`;
  const TEXT_API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize`;

  // ===== INSTRUCTION PROCESSING =====
  const processInstructions = useCallback(() => {
    if (!analyzedInstructions || !analyzedInstructions[0]?.steps) return [];
    
    return analyzedInstructions[0].steps.map(step => 
      `Step ${step.number}: ${step.step}`
    );
  }, [analyzedInstructions]);

  // ===== TEXT-TO-SPEECH METHODS =====
  const synthesizeSpeech = useCallback(async (text) => {
    try {
      // Validate inputs
      if (!text) {
        // console.error('No text provided for speech synthesis');
        return null;
      }

      // Ensure API key is correctly formatted
      if (!API_KEY) {
        // console.error('Missing Google Cloud TTS API key');
        return null;
      }

      const response = await fetch(`${TEXT_API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: { text: text },
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Standard-C'
          },
          audioConfig: {
            audioEncoding: 'MP3'
          }
        })
      });

      // Detailed error handling
      if (!response.ok) {
        //const errorBody = await response.text();
        /*console.error('Speech synthesis API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody
        });*/
        throw new Error(`Speech synthesis failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate audio content
      if (!data.audioContent) {
        // console.error('No audio content received');
        return null;
      }

      // Decode base64 audio content
      const audioContent = data.audioContent;
      
      // Replace Buffer with atob and Uint8Array
      const binaryString = atob(audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      
      const audioUrl = URL.createObjectURL(blob);
      return audioUrl;
    } catch (error) {
      // console.error('Comprehensive Text-to-Speech Error:', error);
      return null;
    }
  }, [API_KEY, TEXT_API_URL]);

  const playCurrentStep = useCallback(async () => {
    const steps = processInstructions();
    if (steps.length === 0) return;

    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      // Synthesize and play current step
      const audioUrl = await synthesizeSpeech(steps[currentStepIndex]);
      if (audioUrl) {
        setAudioUrl(audioUrl);
        setIsPlayingAudio(true);
      } else {
        //console.error('Failed to generate audio for step');
      }
    } catch (error) {
      // console.error('Error playing current step:', error);
    }
  }, [currentStepIndex, processInstructions, synthesizeSpeech]);

  const nextStep = useCallback(() => {
    const steps = processInstructions();
    if (currentStepIndex < steps.length - 1) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Move to next step
      setCurrentStepIndex(prev => prev + 1);
      setIsPlayingAudio(false);
    }
  }, [currentStepIndex, processInstructions]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Move to previous step
      setCurrentStepIndex(prev => prev - 1);
      setIsPlayingAudio(false);
    }
  }, [currentStepIndex]);

  // ===== SPEECH RECOGNITION METHODS =====
  const stopListening = useCallback(() => {
    if (processingInterval.current) clearInterval(processingInterval.current);
    
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
  
    // Explicitly disconnect and nullify the analyser
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
  
    setIsListening(false);
  }, []);

  const handleVoiceCommand = useCallback((transcript) => {
    const now = Date.now();
    if (now - lastCommandTime.current < 2000) return;
    lastCommandTime.current = now;

    const normalized = transcript.toLowerCase().trim();

    if (normalized.includes('play')) {
      setIsPlayingAudio(true);
      playCurrentStep();
    }
    else if (normalized.includes('pause')) {
      setIsPlayingAudio(false);
      if (audioRef.current) audioRef.current.pause();
    }
    else if (normalized.includes('skip') || normalized.includes('next')) {
      nextStep();
    }
    else if (normalized.includes('go back') || normalized.includes('previous')) {
      previousStep();
    }
    else if (normalized.includes('stop listening')) {
      stopListening();
    }
  }, [stopListening, playCurrentStep, nextStep, previousStep]);

  const recognizeSpeech = useCallback(async (audioData) => {
    const audioBlob = new Blob([audioData], { type: 'audio/webm' });
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          if (!reader.result) {
            reject(new Error('Failed to read audio data'));
            return;
          }
          const audioContent = reader.result.split(',')[1];
          const response = await fetch(SPEECH_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              config: {
                encoding: 'WEBM_OPUS',
                sampleRateHertz: 48000,
                languageCode: 'en-US',
                model: 'command_and_search'
              },
              audio: { content: audioContent }
            })
          });
          const data = await response.json();
          resolve(data.results?.[0]?.alternatives?.[0]?.transcript || '');
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(audioBlob);
    });
  }, [SPEECH_API_URL]);

  const startListening = useCallback(async () => {
    try {
      // Stop any existing streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
  
      // Audio processing setup
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const microphone = audioContextRef.current.createMediaStreamSource(stream);
      microphone.connect(analyserRef.current);
  
      let isSpeaking = false;
      let silenceStart = 0;
      const SPEECH_TIMEOUT = 1500; // 1.5s of silence = phrase end
      const VOLUME_THRESHOLD = 0.1; // Minimum volume to consider as speech
  
      // Process audio in real-time
      const processAudio = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const currentVolume = Math.max(...dataArray) / 255;
  
        // Speech detection logic
        if (currentVolume > VOLUME_THRESHOLD) {
          if (!isSpeaking) {
            isSpeaking = true;
            // console.log("Speech started");
          }
          silenceStart = 0;
        } else if (isSpeaking) {
          if (!silenceStart) silenceStart = Date.now();
          if (Date.now() - silenceStart > SPEECH_TIMEOUT) {
            isSpeaking = false;
            mediaRecorderRef.current?.requestData(); // Trigger processing
            // console.log("Speech ended - processing");
          }
        }
  
        requestAnimationFrame(processAudio);
      };
  
      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          setIsProcessing(true);
          try {
            const transcript = await recognizeSpeech(event.data);
            if (transcript) handleVoiceCommand(transcript);
          } catch (error) {
            // console.error('Speech recognition error:', error);
          } finally {
            setIsProcessing(false);
          }
        }
      };
  
      mediaRecorderRef.current.start();
      processAudio(); // Start processing loop
      setIsListening(true);
  
    } catch (error) {
      // console.error('Error starting microphone:', error);
      setIsListening(false);
    }
  }, [recognizeSpeech, handleVoiceCommand]);

  

  // ===== UI TOGGLES =====
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleListening = async () => {
    if (!isListening) await startListening();
    else stopListening();
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ===== RENDER =====
  return (
    <div className="tts-container">
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl}
          onEnded={() => setIsPlayingAudio(false)}
          autoPlay={isPlayingAudio}
          data-testId='audio-component'
        />
      )}

      {!API_KEY && (
        <div className="error-message">
          Google Cloud TTS API key is missing. Please check your configuration.
        </div>
      )}

      <div className="tts-controls">
        <button className={`image-button ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <div className='image-container'>
            <img
              src={'/Media/Text-To-Speech.png'}
              alt="TTS"
              className='image-button'
              data-testid='text-to-speech'
            />
          </div>
        </button>
        
        <button 
          className="tts-menu-item-list" 
          onClick={toggleListening}
          disabled={isProcessing}      
          data-testid='listening-button'  
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
          </svg>
          {isProcessing ? 'Processing...' : isListening ? 'Start Processing' : 'Start Listening'} 
          <div 
          className="info-icon"
          onClick={() => setShowCommands(!showCommands)}
          onMouseEnter={() => setShowCommands(true)}
          onMouseLeave={() => setShowCommands(false)}
            >
              ℹ️
            </div>

          {showCommands && (
            <div className="commands-tooltip">
              <h4>Available Commands</h4>
              <ul>
                <li>"Play"</li>
                <li>"Pause"</li>
                <li>"Skip"</li>
                <li>"Go Back"</li>
              </ul>
            </div>
          )}
        </button>

        
      </div>

      {isMenuOpen && (
        <div className="tts-menu" ref={menuRef} role="menu">
          {processInstructions().length > 0 && (
            <>
              {/* Go Back Button */}
              <button 
                className="tts-menu-item" 
                onClick={previousStep}
                disabled={currentStepIndex === 0}
              >
                <svg className="menu-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M6,18.14V5.14H8V18.14H6Z" />
                  <path fill="currentColor" d="M9.5,12.14L16,5.64V18.64L9.5,12.14Z" />
                </svg>
                Go Back
              </button>

              {/* Play/Pause Button */}
              <button 
                className="tts-menu-item" 
                
                data-testid="pause-button"
                onClick={() => {
                  if (isPlayingAudio) {
                    if (audioRef.current) audioRef.current.pause();
                    setIsPlayingAudio(false);
                  } else {
                    playCurrentStep();
                    setIsPlayingAudio(true);
                  }
                }}
              >
                <svg className="menu-icon" viewBox="0 0 24 24" width="16" height="16">
                  {isPlayingAudio ? (
                    <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
                  ) : (
                    <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                  )}
                </svg>
                {isPlayingAudio ? 'Pause' : 'Play'}
              </button>

              {/* Skip Button */}
              <button 
                className="tts-menu-item" 
                onClick={nextStep}
                disabled={currentStepIndex === processInstructions().length - 1}
              >
                <svg className="menu-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                  <path fill="currentColor" d="M15,5.14V19.14L19,12.14L15,5.14Z" />
                </svg>
                Skip
              </button>

              {/* Current Step Display */}
              <div className="tts-menu-step">
                Step {currentStepIndex + 1} of {processInstructions().length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TTS;