import React, { useState, useEffect, useRef, useCallback } from 'react';
import './TranslateTTSBox.css';
import { useErrorModal } from '../ErrorModal';

const TTS = ({analyzedInstructions}) => {
  // state management variables
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [showCommands, setShowCommands] = useState(false);

  // ref variables
  const menuRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const lastCommandTime = useRef(0);
  const processingInterval = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);

  // API keys
  const API_KEY = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;
  const SPEECH_API_URL = `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`;
  const TEXT_API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize`;

  // Error box
  const { showErrorModal } = useErrorModal();

  // Error modal shows up if key is missing
  useEffect(() => {
    if (!API_KEY) {
      showErrorModal({
        context: 'Missing API Key',
        message: 'Google Cloud API key is missing. Please check your configuration.'
      });
    }
  }, [API_KEY, showErrorModal]);


  // Format spoonacular instructions 
  const processInstructions = useCallback(() => {
    if (!analyzedInstructions || !analyzedInstructions[0]?.steps) return [];
    
    // Step #: Instruction
    return analyzedInstructions[0].steps.map(step => 
      `Step ${step.number}: ${step.step}`
    );
  }, [analyzedInstructions]);

  // TEXT-TO-SPEECH 
  const synthesizeSpeech = useCallback(async (text) => {
    try {
      // Ensure valid text
      if (!text) {
        return null;
      }

      // Ensure API key exists
      if (!API_KEY) {
        return null;
      }

      // get the audio
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

      // Ensure it didn't fail
      if (!response.ok) {
        throw new Error(`Speech synthesis failed: ${response.status}`);
      }

      // Grab the data
      const data = await response.json();
      
      // Validate audio content
      if (!data.audioContent) {
        return null;
      }

      // Decode base64 audio content
      const audioContent = data.audioContent;
      
      // turns the audio string into a playable link
      const binaryString = atob(audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      
      const audioUrl = URL.createObjectURL(blob);

      return audioUrl;

    } catch (error) {
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
      // Get the audio
      const audioUrl = await synthesizeSpeech(steps[currentStepIndex]);

      // Play the audio if there is sound
      if (audioUrl) {
        setAudioUrl(audioUrl);
        setIsPlayingAudio(true);
      } else {
      }
    } catch (error) {
    }
  }, [currentStepIndex, processInstructions, synthesizeSpeech]);

  const nextStep = useCallback(() => {
    const steps = processInstructions();

    // If you can skip a step, 
    if (currentStepIndex < steps.length - 1) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Move to next step
      setCurrentStepIndex(prev => prev + 1);

      // Pause
      setIsPlayingAudio(false);
    }
  }, [currentStepIndex, processInstructions]);

  const previousStep = useCallback(() => {
    
    // Make sure there is a step before
    if (currentStepIndex > 0) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Move to previous step
      setCurrentStepIndex(prev => prev - 1);

      // Pause
      setIsPlayingAudio(false);
    }
  }, [currentStepIndex]);

  // SPEECH RECOGNITION 
  const stopListening = useCallback(() => {
    // reset the processing interval
    if (processingInterval.current) clearInterval(processingInterval.current);

    // stop the recorder
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Stop the Audio controller
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
    
    // Stop the audio analyzer
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    // Set to stop listening
    setIsListening(false);
  }, []);

  const handleVoiceCommand = useCallback((transcript) => {
    // Ensure no spamming of calls
    const now = Date.now();
    if (now - lastCommandTime.current < 2000) return;
    lastCommandTime.current = now;

    // Simplify transcript
    const normalized = transcript.toLowerCase().trim();

    // Execute commands based on audio input
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
    // Format the audio
    const audioBlob = new Blob([audioData], { type: 'audio/webm' });
    
    return new Promise((resolve, reject) => {
      // Read the audio data as a base64-encoded URL
      const reader = new FileReader();

      // Send audio to the speech API and process the response
      reader.onloadend = async () => {
        try {
          // Check to make sure the audio data is readible
          if (!reader.result) {
            reject(new Error('Failed to read audio data'));
            return;
          }

          // Remove the unnecessary base64 content
          const audioContent = reader.result.split(',')[1];

          // Send the audio to the API
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

          // Grab the API response and extract the transcript
          const data = await response.json();
          resolve(data.results?.[0]?.alternatives?.[0]?.transcript || '');
        } catch (error) {
          reject(error);
        }
      };

      // Returns error if failed to read the audio at the beginning
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

      // Request mic access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Initialize MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      // Set up volume analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const microphone = audioContextRef.current.createMediaStreamSource(stream);
      microphone.connect(analyserRef.current);
      
      // VAD config
      let isSpeaking = false;
      let silenceStart = 0;
      const SPEECH_TIMEOUT = 1500; 
      const VOLUME_THRESHOLD = 0.1; 
  
      const processAudio = () => {
        if (!analyserRef.current) return;

        // Get the frequency data
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const currentVolume = Math.max(...dataArray) / 255;

        // Speech detection
        if (currentVolume > VOLUME_THRESHOLD) {
          if (!isSpeaking) {
            isSpeaking = true;
          }

          silenceStart = 0;
        } else if (isSpeaking) {
          // Check for timeout
          if (!silenceStart) silenceStart = Date.now();
          if (Date.now() - silenceStart > SPEECH_TIMEOUT) {
            // Export data
            isSpeaking = false;
            mediaRecorderRef.current?.requestData();
          }
        }
        
        // Continue processing
        requestAnimationFrame(processAudio); 
      };
      
      // Handle completed audio chunks
      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          setIsProcessing(true);
          try {
            // Send the audio to the API
            const transcript = await recognizeSpeech(event.data);

            // Process any commands
            if (transcript) handleVoiceCommand(transcript);
          } catch (error) {} 
          finally {
            setIsProcessing(false);
          }
        }
      };
      
      // Start recording
      mediaRecorderRef.current.start();

      // Begin loop
      processAudio();

      // Update UI
      setIsListening(true);
  
    } catch (error) {
      setIsListening(false);
    }
  }, [recognizeSpeech, handleVoiceCommand]);

  

  // toggles open/close menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleListening = async () => {
    if (!isListening) await startListening();
    else stopListening();
  };

  // Cleanup effect - stop listening when component unmounts
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

  // RENDER 
  return (
    <div className="tts-container">
      {/* Audio player - only shown when there's audio to play */}
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl}
          onEnded={() => setIsPlayingAudio(false)}  // Handle audio end
          autoPlay={isPlayingAudio}  // Auto-plays when isPlayingAudio is true
          data-testid='audio-component'
        />
      )}
  
      {/* Main controls container */}
      <div className="tts-controls">
        {/* Toggle menu button with active state styling */}
        <button className={`image-button ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <img
              className='img-button'
              src={'/Media/Text-To-Speech.png'}
              alt="TTS"
              data-testid='text-to-speech'
            />
        </button>
        
        {/* Voice listening control button */}
        <button 
          className="tts-menu-item-list" 
          onClick={toggleListening}
          disabled={isProcessing}  // Disable during processing
          data-testid='listening-button'  
        >
          {/* Microphone icon with pulse animation when listening */}
          <svg viewBox="0 0 24 24" width="16" height="16" className={isListening ? "animate-pulse" : ""}>
            <path fill="currentColor" d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
          </svg>
          {/* Dynamic button text based on state */}
          {isProcessing ? 'Processing...' : isListening ? 'Start Processing' : 'Start Listening'} 
          
          {/* Info icon that shows available commands */}
          <div 
            className="info-icon"
            onClick={() => setShowCommands(!showCommands)}
            onMouseEnter={() => setShowCommands(true)}
            onMouseLeave={() => setShowCommands(false)}
            
          >
            
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              className="info-icon-svg"
            >
              <rect x="2" y="2" width="20" height="20" rx="4" ry="4" fill="currentColor" stroke="#36395A" strokeWidth="1"/>
              <text
                x="12"
                y="16"
                dy="2"
                textAnchor="middle"
                fontFamily="Inria Sans, sans-serif"
                fontSize="18"
                fill="white"
                fontWeight="bold"
              >
                i
              </text>
            </svg>
          </div>
  
          {/* Tooltip showing available voice commands */}
          {showCommands && (
            <div className="commands-tooltip">
              <h4>Available Voice Commands</h4>
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
  
      {/* Menu that appears when isMenuOpen is true */}
      {isMenuOpen && (
        <div className="tts-menu" ref={menuRef} role="menu">
          {/* Only show menu items if there are instructions */}
          {processInstructions().length > 0 && (
            <>
              {/* Navigation button to go to previous step */}
              <button 
                className="tts-menu-item" 
                onClick={previousStep}
                disabled={currentStepIndex === 0}  // Disable if on first step
              >
                <svg className="menu-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M6,18.14V5.14H8V18.14H6Z" />
                  <path fill="currentColor" d="M9.5,12.14L16,5.64V18.64L9.5,12.14Z" />
                </svg>
                Go Back
              </button>
  
              {/* Button to play/pause current step */}
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
  
              {/* Button to skip to next step */}
              <button 
                className="tts-menu-item" 
                onClick={nextStep}
                disabled={currentStepIndex === processInstructions().length - 1}  // Disable if on last step
              >
                <svg className="menu-icon skip-icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M6,18.14V5.14H8V18.14H6Z" />
                <path fill="currentColor" d="M9.5,12.14L16,5.64V18.64L9.5,12.14Z" />
                </svg>
                Skip
              </button>
  
              {/* Current step progress indicator */}
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