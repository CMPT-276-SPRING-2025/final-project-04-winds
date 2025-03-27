import React, { useState, useEffect, useRef, useCallback } from 'react';
import './TranslateTTSBox.css';

const TTS = ({analyzedInstructions}) => {
  // ===== STATE MANAGEMENT =====
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ===== REFS =====
  const menuRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const lastCommandTime = useRef(0);
  const processingInterval = useRef(null);
  const streamRef = useRef(null);

  // ===== GOOGLE CLOUD CONFIG =====
  const API_KEY = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;
  const SPEECH_API_URL = `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`;

  const tts_api_key = process.env.REACT_APP_GOOGLE_CLOUD_TTS_CREDENTIALS;
  const TEXT_API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${tts_api_key}`;

  // ===== REAL-TIME PROCESSING =====
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
            console.log("Speech started");
          }
          silenceStart = 0;
        } else if (isSpeaking) {
          if (!silenceStart) silenceStart = Date.now();
          if (Date.now() - silenceStart > SPEECH_TIMEOUT) {
            isSpeaking = false;
            mediaRecorderRef.current?.requestData(); // Trigger processing
            console.log("Speech ended - processing");
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
            console.error('Speech recognition error:', error);
          } finally {
            setIsProcessing(false);
          }
        }
      };
  
      mediaRecorderRef.current.start();
      processAudio(); // Start processing loop
      setIsListening(true);
  
    } catch (error) {
      console.error('Error starting microphone:', error);
      setIsListening(false);
    }
  }, []);

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

  const recognizeSpeech = async (audioData) => {
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
  };

  const handleVoiceCommand = useCallback((transcript) => {
    const now = Date.now();
    if (now - lastCommandTime.current < 2000) return;
    lastCommandTime.current = now;

    const normalized = transcript.toLowerCase().trim();

    if (normalized.includes('play')) {
      setIsPlayingAudio(false);
      console.log('EXECUTE COMMAND PLAY');
    }
    else if (normalized.includes('pause')) {
      setIsPlayingAudio(true);
      console.log('EXECUTE COMMAND PAUSE');
    }
    else if (normalized.includes('skip')) {
      console.log('EXECUTE COMMAND SKIP');
    }
    else if (normalized.includes('go back')) {
      console.log('EXECUTE COMMAND GO BACK');
    }
    else if (normalized.includes('stop listening')) {
      stopListening();
      console.log('EXECUTE COMMAND STOP LISTENING');
    }
  }, [stopListening]);

  // ===== UI TOGGLES =====
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const togglePlaying = () => setIsPlayingAudio(!isPlayingAudio);
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
    <div className="tts-container" >
      <div className="tts-controls">
        <button className='image-button' onClick={toggleMenu}>
          <img
            src={'/Media/Text-To-Speech.png'}
            alt="TTS"
            className='image-button'
            data-testid='text-to-speech'
          />
        </button>
        
        <button 
        className="tts-menu-item-list" 
        onClick={toggleListening}
        disabled={isProcessing}        
        >
          <svg viewBox="0 0 24 24" width="16" height="16" >
            <path fill="currentColor" d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
          </svg>
          {isProcessing ? 'Processing...' : isListening ? 'Stop Listening' : 'Start Listening'}            
        </button>
      </div>
  
      {isMenuOpen && (
        <div className="tts-menu" ref={menuRef}>
          {analyzedInstructions?.length > 0 && (
            <>
              <button className="tts-menu-item" onClick={togglePlaying}>
                <svg className="menu-icon" viewBox="0 0 24 24" width="16" height="16">
                  {isPlayingAudio ? (
                    <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
                  ) : (
                    <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                  )}
                </svg>
                {isPlayingAudio ? 'Pause' : 'Play'}
              </button>
              <button className="tts-menu-item">
                <svg className="menu-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                  <path fill="currentColor" d="M15,5.14V19.14L19,12.14L15,5.14Z" />
                </svg>
                Skip
              </button>
              <button className="tts-menu-item">
                <svg className="menu-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M6,18.14V5.14H8V18.14H6Z" />
                  <path fill="currentColor" d="M9.5,12.14L16,5.64V18.64L9.5,12.14Z" />
                </svg>
                Go Back
              </button>
            </>
          )}
                  
        </div>
      )}
    </div>
  );
};

export default TTS;