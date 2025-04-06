/* eslint-disable testing-library/no-wait-for-multiple-assertions */
/* eslint-disable jest/no-identical-title */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Component to be tested
import TTS from '../Title_Card/TTS';

// Mock error modal component to prevent actual error popups during tests
jest.mock('../ErrorModal', () => ({
  useErrorModal: () => ({
    showErrorModal: jest.fn(), 
  }),
}));

// Store original environment variables for cleanup
const originalEnv = process.env;

// Mock MediaRecorder API with basic implementation
global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  requestData: jest.fn(),
  state: 'inactive',
  ondataavailable: jest.fn(),
}));

// Mock AudioContext and AnalyserNode for volume detection
class MockAnalyser {
  constructor() {
    this.frequencyBinCount = 1024;
    this.connect = jest.fn();
    this.disconnect = jest.fn();
    this.getByteFrequencyData = jest.fn(array => {
      // Simulate sound data
      array[0] = 128; // 50% volume
    });
  }
}

class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.createAnalyser = jest.fn().mockImplementation(() => new MockAnalyser());
    this.createMediaStreamSource = jest.fn().mockImplementation(() => ({
      connect: jest.fn(),
    }));
    this.close = jest.fn(() => {
      this.state = 'closed';
    });
  }
}

global.AudioContext = MockAudioContext;

// Mock FileReader for base64 audio conversion
class MockFileReader {
  constructor() {
    this.onloadend = null;
    this.onerror = null;
    this.result = 'data:audio/webm;base64,mock-audio-content';
  }
  
  readAsDataURL() {
    setTimeout(() => {
      if (this.onloadend) this.onloadend();
    }, 0);
  }
}

global.FileReader = MockFileReader;

// Mock requestAnimationFrame for audio processing loop
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));

// Mock browser media APIs
navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
    getTracks: () => [{ stop: jest.fn() }],
  }),
};

// Mock fetch API and other browser APIs
global.fetch = jest.fn();
global.atob = jest.fn().mockImplementation(str => str);
global.URL.createObjectURL = jest.fn().mockImplementation(blob => 'mock-audio-url');

describe('TTS Component', () => {
  // Sample recipe instructions for testing
  const sampleInstructions = [
    {
      steps: [
        { number: 1, step: 'First step instruction' },
        { number: 2, step: 'Second step instruction' },
        { number: 3, step: 'Third step instruction' },
      ]
    }
  ];

  beforeEach(() => {
    // Suppress React act warnings
    global.IS_REACT_ACT_ENVIRONMENT = false;

    // Reset all mocks between tests
    jest.clearAllMocks();

    // Reset environment variables
    process.env = { ...originalEnv, REACT_APP_GOOGLE_CLOUD_API_KEY: 'test-api-key' };
    
    // Mock fetch responses for different API endpoints
    global.fetch.mockImplementation((url) => {
      if (url.includes('texttospeech.googleapis.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ audioContent: 'mock-audio-content' }),
        });
      } else if (url.includes('speech.googleapis.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            results: [{ alternatives: [{ transcript: 'play' }] }]
          }),
        });
      }
      return Promise.reject(new Error('Unhandled fetch'));
    });

    // Mock HTMLMediaElement methods
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value: jest.fn(),
    });

    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: jest.fn(),
    });

    // Clear media element mocks
    HTMLMediaElement.prototype.play.mockClear();
    HTMLMediaElement.prototype.pause.mockClear();
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  // === BASIC RENDERING TESTS ===

  // Verify component mounts without errors
  test('Renders without crashing', () => {
    render(<TTS />);
    expect(screen.getByTestId('text-to-speech')).toBeInTheDocument();
  });

  // Check TTS icon renders correctly
  test('Renders the TTS Icon', () => {
    render(<TTS />);
    
    const ttsIcon = screen.getByTestId('text-to-speech');
    expect(ttsIcon).toBeInTheDocument();
    expect(ttsIcon).toHaveAttribute('src', '/Media/Text-To-Speech.png');
  });

  // Verify component styling
  test('applies the correct styling to the TTS', () => {
    render(<TTS className='languageBox' />);
    
    expect(screen.getByTestId('text-to-speech')).toHaveClass('image-button');
  });

  // === MENU INTERACTION TESTS ===

  // Test menu toggle functionality
  test('Opens and closes menu when clicking the button', () => {
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Menu should be closed initially
    expect(screen.queryByText('Play')).not.toBeInTheDocument();
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    expect(screen.getByText('Play')).toBeInTheDocument();
    
    // Close menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    expect(screen.queryByText('Play')).not.toBeInTheDocument();
  });

  // Test clicking outside closes menu
  test('Closes menu when clicking outside', async () => {
    render(
      <div>
        <TTS analyzedInstructions={sampleInstructions} />
        <div data-testid="outside-element">Outside Element</div>
      </div>
    );
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    expect(screen.getByText('Play')).toBeInTheDocument();
    
    // Click outside element
    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    
    // Verify menu closed
    expect(screen.queryByText('Play')).not.toBeInTheDocument();
  });

  // === INSTRUCTION PROCESSING TESTS ===

  // Test instruction step handling
  test('Processes instructions correctly', () => {
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // Verify step count display
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  // Test empty instructions handling
  test('Handles empty instructions', () => {
    render(<TTS analyzedInstructions={[{}]} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // No steps should be shown
    expect(screen.queryByText(/Step/)).not.toBeInTheDocument();
  });

  // Test null instructions handling
  test('Handles null instructions', () => {
    render(<TTS analyzedInstructions={null} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // No steps should be shown
    expect(screen.queryByText(/Step/)).not.toBeInTheDocument();
  });

  // === AUDIO PLAYBACK TESTS ===

  // Test play/pause toggle functionality
  test('Audio playback controls work correctly', async () => {
    render(<TTS analyzedInstructions={sampleInstructions} />);

    // Open menu and click play
    fireEvent.click(screen.getByTestId('text-to-speech'));
    fireEvent.click(screen.getByText('Play'));

    // Verify pause button appears
    expect(screen.getByText('Pause')).toBeInTheDocument();

    // Click pause
    fireEvent.click(screen.getByText('Pause'));

    // Verify play button reappears
    expect(screen.getByText('Play')).toBeInTheDocument();
  });

  // Test navigation between steps
  test('Next and previous step buttons work correctly', async () => {
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // Verify initial step
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    
    // Click next
    fireEvent.click(screen.getByText('Skip'));
    
    // Verify step 2
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    
    // Click next again
    fireEvent.click(screen.getByText('Skip'));
    
    // Verify step 3
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
    
    // Skip button should be disabled at last step
    expect(screen.getByText('Skip')).toBeDisabled();
    
    // Go back to step 2
    fireEvent.click(screen.getByText('Go Back'));
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    
    // Go back to step 1
    fireEvent.click(screen.getByText('Go Back'));
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    
    // Back button should be disabled at first step
    expect(screen.getByText('Go Back')).toBeDisabled();
  });

  // === TEXT-TO-SPEECH API TESTS ===

  // Test TTS API call with correct parameters
  test('Synthesizes speech correctly', async () => {
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // Click play button
    fireEvent.click(screen.getByText('Play'));
    
    // Verify API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('texttospeech.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('en-US')
        })
      );
    });
  });

  // Test TTS API failure handling
  test('Handles TTS API failure', async () => {
    // Mock API failure
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server Error')
      })
    )
        
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // Attempt playback
    fireEvent.click(screen.getByText('Play'));
    
    // Verify API was called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  // Test missing audio content handling
  test('Handles missing audio content in response', async () => {
    // Mock empty response
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ /* No audioContent */ })
      })
    );
    
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // Attempt playback
    fireEvent.click(screen.getByText('Play'));
    
    // Verify API was called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  // === VOICE RECOGNITION TESTS === 

  // Test microphone permission denial
  test('Handles getUserMedia errors', async () => {
    // Mock permission error
    navigator.mediaDevices.getUserMedia.mockImplementationOnce(() => 
      Promise.reject(new Error('Permission denied'))
    );
    
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Attempt to start listening
    fireEvent.click(screen.getByText('Start Listening'));
    
    // Verify button state remains unchanged
    await waitFor(() => {
      expect(screen.getByText('Start Listening')).toBeInTheDocument();
    });
  });

  // Test "play" voice command
  test('Voice command processing - play', async () => {
    // Setup MediaRecorder mock
    const mockDataEvent = { data: new Blob(['mock-audio-data'], { type: 'audio/webm' }) };
    
    let mediaRecorderInstance;
    global.MediaRecorder.mockImplementation(() => {
      mediaRecorderInstance = {
        start: jest.fn(),
        stop: jest.fn(),
        requestData: jest.fn(),
        state: 'recording',
        ondataavailable: null
      };
      return mediaRecorderInstance;
    });
    
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Start listening
    fireEvent.click(screen.getByText('Start Listening'));
    
    // Mock API response with "play" command
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          results: [{ alternatives: [{ transcript: 'play' }] }]
        }),
      })
    );

    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Trigger audio data event
    await act(async () => {
      mediaRecorderInstance.ondataavailable(mockDataEvent);
    });
    
    // Verify speech API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('speech.googleapis.com'),
        expect.any(Object)
      );
    });
    
    // Verify TTS API was triggered
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('texttospeech.googleapis.com'),
        expect.any(Object)
      );
    });
  });

  // Test "pause" voice command
  test('Voice command processing - pause', async () => {
    // Setup playing state first
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu and play
    fireEvent.click(screen.getByTestId('text-to-speech'));
    fireEvent.click(screen.getByText('Play'));
    
    // Setup MediaRecorder mock
    const mockDataEvent = { data: new Blob(['mock-audio-data'], { type: 'audio/webm' }) };
    let mediaRecorderInstance;
    global.MediaRecorder.mockImplementation(() => {
      mediaRecorderInstance = {
        start: jest.fn(),
        stop: jest.fn(),
        requestData: jest.fn(),
        state: 'recording',
        ondataavailable: null
      };
      return mediaRecorderInstance;
    });
    
    // Start listening
    fireEvent.click(screen.getByText('Start Listening'));
    
    // Mock API response with "pause" command
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          results: [{ alternatives: [{ transcript: 'pause' }] }]
        }),
      })
    );

    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Trigger audio data event
    await act(async () => {
      mediaRecorderInstance.ondataavailable(mockDataEvent);
    });
    
    // Verify speech API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('speech.googleapis.com'),
        expect.any(Object)
      );
    });
    
    // Verify UI updated to show play button
    await waitFor(() => {
      expect(screen.getByTestId('pause-button')).toHaveTextContent(/play/i);
    });
  });

  // Test "next/skip" voice command
  test('Voice command processing - next/skip', async () => {
    // Setup MediaRecorder mock
    const mockDataEvent = { data: new Blob(['mock-audio-data'], { type: 'audio/webm' }) };
    let mediaRecorderInstance;
    global.MediaRecorder.mockImplementation(() => {
      mediaRecorderInstance = {
        start: jest.fn(),
        stop: jest.fn(),
        requestData: jest.fn(),
        state: 'recording',
        ondataavailable: null
      };
      return mediaRecorderInstance;
    });
    
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // Verify initial step
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    
    // Start listening
    fireEvent.click(screen.getByText('Start Listening'));
    
    // Mock API response with "next" command
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          results: [{ alternatives: [{ transcript: 'next' }] }]
        }),
      })
    );

    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Trigger audio data event
    await act(async () => {
      mediaRecorderInstance.ondataavailable(mockDataEvent);
    });
    
    // Verify speech API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('speech.googleapis.com'),
        expect.any(Object)
      );
    });
    
    // Verify moved to next step
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
  });

  // Test "previous/go back" voice command
  test('Voice command processing - previous/go back', async () => {
    // Setup MediaRecorder mock
    const mockDataEvent = { data: new Blob(['mock-audio-data'], { type: 'audio/webm' }) };
    let mediaRecorderInstance;
    global.MediaRecorder.mockImplementation(() => {
      mediaRecorderInstance = {
        start: jest.fn(),
        stop: jest.fn(),
        requestData: jest.fn(),
        state: 'recording',
        ondataavailable: null
      };
      return mediaRecorderInstance;
    });
    
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // Move to step 2 first
    fireEvent.click(screen.getByText('Skip'));
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    
    // Start listening
    fireEvent.click(screen.getByText('Start Listening'));
    
    // Mock API response with "go back" command
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          results: [{ alternatives: [{ transcript: 'go back' }] }]
        }),
      })
    );

    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Trigger audio data event
    await act(async () => {
      mediaRecorderInstance.ondataavailable(mockDataEvent);
    });
    
    // Verify speech API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('speech.googleapis.com'),
        expect.any(Object)
      );
    });
    
    // Verify moved back to step 1
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  // Test speech recognition failure
  test('Speech recognition failure handling', async () => {
    // Setup MediaRecorder mock
    const mockDataEvent = { data: new Blob(['mock-audio-data'], { type: 'audio/webm' }) };
    let mediaRecorderInstance;
    global.MediaRecorder.mockImplementation(() => {
      mediaRecorderInstance = {
        start: jest.fn(),
        stop: jest.fn(),
        requestData: jest.fn(),
        state: 'recording',
        ondataavailable: null
      };
      return mediaRecorderInstance;
    });
    
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Start listening
    fireEvent.click(screen.getByText('Start Listening'));
    
    // Mock API failure
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );

    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Trigger audio data event
    await act(async () => {
      mediaRecorderInstance.ondataavailable(mockDataEvent);
    });
    
    // Verify processing indicator disappears
    await waitFor(() => {
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
    });
  });

  // Test FileReader error handling
  test('FileReader error handling', async () => {
    // Store original FileReader
    const OriginalFileReader = global.FileReader;
  
    // Mock failing FileReader
    global.FileReader = class MockFailingFileReader {
      constructor() {
        this.onloadend = null;
        this.onerror = null;
        setTimeout(() => {
          if (this.onerror) this.onerror(new Error('FileReader error'));
        }, 0);
      }
      readAsDataURL() {}
    };
  
    // Setup MediaRecorder mock
    const mockDataEvent = { data: new Blob(['test'], { type: 'audio/webm' }) };
    let mediaRecorderInstance;
  
    global.MediaRecorder = jest.fn(function () {
      mediaRecorderInstance = {
        start: jest.fn(),
        stop: jest.fn(),
        requestData: jest.fn(),
        state: 'recording',
        ondataavailable: null, 
      };
      return mediaRecorderInstance;
    });
  
    // Render component
    render(<TTS analyzedInstructions={sampleInstructions} />);
  
    // Start listening
    fireEvent.click(screen.getByText('Start Listening'));
  
    // Wait for setup
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10)); 
    });
  
    // Trigger data event if handler exists
    await act(async () => {
      if (mediaRecorderInstance.ondataavailable) {
        mediaRecorderInstance.ondataavailable(mockDataEvent);
      }
    });
  
    // Verify processing indicator disappears
    await waitFor(() => {
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
    });
  
    // Restore original FileReader
    global.FileReader = OriginalFileReader;
  });

  // === CLEAN UP AND RESOURCE HANDLING ===

  // Test empty steps array handling
  test('Handles missing instruction steps gracefully', () => {
    const emptyInstructions = [{ steps: [] }];
    render(<TTS analyzedInstructions={emptyInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // No steps should be shown
    expect(screen.queryByText(/Step/)).not.toBeInTheDocument();
  });

  // Test audio state reset when changing steps
  test('Audio state is reset when changing steps', async () => {
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  
    // Start playback
    const playButton = await screen.findByRole('button', { name: /(play|pause)/i });
    fireEvent.click(playButton);
  
    // Verify playing state
    await waitFor(() => {      
      expect(playButton).toHaveTextContent(/pause/i); 
    });
  
    // Skip to next step
    const skipButton = await screen.findByRole('button', { name: /skip/i });
    fireEvent.click(skipButton);

    // Verify playback stopped
    expect(await screen.findByRole('button', { name: /play/i })).toBeInTheDocument();
  });
});

// Sample instructions for second test suite
const sampleInstructions = [{
  steps: [
      { number: 1, step: "First test step." },
      { number: 2, step: "Second test step." }
  ]
}];

// Second test suite with more detailed mocks
describe('TTS Component', () => {
  // Mock objects
  let mockStopFn;
  let mockTrack;
  let mockStream;
  let mockMediaRecorderInstance;
  let mockAudioContextInstance;

  beforeEach(() => {
      // Initialize mocks
      mockStopFn = jest.fn();
      mockTrack = { stop: mockStopFn, kind: 'audio' }; 
      mockStream = {
          getTracks: jest.fn(() => [mockTrack]),
          active: true
      };

      // Mock navigator.mediaDevices.getUserMedia
      Object.defineProperty(navigator, 'mediaDevices', {
          value: {
              getUserMedia: jest.fn().mockResolvedValue(mockStream), 
          },
          writable: true,
          configurable: true,
      });

      // Mock MediaRecorder with more functionality
      mockMediaRecorderInstance = {
          start: jest.fn(() => { mockMediaRecorderInstance.state = 'recording'; }),
          stop: jest.fn(() => { mockMediaRecorderInstance.state = 'inactive'; }),
          ondataavailable: null, 
          onerror: null, 
          state: 'inactive',
          mimeType: 'audio/webm;codecs=opus',
          requestData: jest.fn(() => {
              if (mockMediaRecorderInstance.ondataavailable) {
                   const mockBlob = new Blob(['mock audio'], { type: 'audio/webm;codecs=opus' });
                   mockMediaRecorderInstance.ondataavailable({ data: mockBlob });
              }
          }),
      };
      global.MediaRecorder = jest.fn(() => mockMediaRecorderInstance);
      global.MediaRecorder.isTypeSupported = jest.fn().mockReturnValue(true);

      // Mock AudioContext with more functionality
      mockAudioContextInstance = {
          createAnalyser: jest.fn(() => ({
              connect: jest.fn(),
              disconnect: jest.fn(),
              frequencyBinCount: 1024,
              getByteFrequencyData: jest.fn(),
          })),
          createMediaStreamSource: jest.fn(() => ({
              connect: jest.fn(),
              disconnect: jest.fn(),
          })),
          close: jest.fn(() => { mockAudioContextInstance.state = 'closed'; }),
          state: 'running',
           sampleRate: 48000
      };
      global.AudioContext = jest.fn(() => mockAudioContextInstance);

      // Mock URL methods
      global.URL.createObjectURL = jest.fn(() => 'mock://blob-url');
      global.URL.revokeObjectURL = jest.fn();

      // Mock fetch API
      global.fetch = jest.fn(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ /* minimal success response */ }),
          text: () => Promise.resolve('mock text response')
      }));

      // Mock base64 decoding
      global.atob = jest.fn(base64 => `decoded:${base64}`);
  });

  afterEach(() => {
      // Clean up all mocks
      jest.restoreAllMocks();

      // Delete mocked globals
      delete navigator.mediaDevices;
      delete global.MediaRecorder;
      delete global.AudioContext;
      delete global.URL.createObjectURL;
      delete global.URL.revokeObjectURL;
      delete global.fetch;
      delete global.atob;
  });

  // Test resource cleanup on unmount
  test('Cleans up resources on unmount', async () => {
    const { unmount } = render(<TTS analyzedInstructions={sampleInstructions} />);

    // Start listening
    const listenButton = screen.getByTestId('listening-button');
    expect(listenButton).toHaveTextContent(/start listening/i);
    fireEvent.click(listenButton);

    // Verify media APIs called
    await waitFor(() => {
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    });

    await waitFor(() => {
        expect(listenButton).toHaveTextContent(/start processing/i);
        expect(mockMediaRecorderInstance.start).toHaveBeenCalledTimes(1);
    });

    // Unmount component
    unmount();

    // Verify cleanup functions called
    expect(mockStopFn).toHaveBeenCalledTimes(1);
    expect(mockMediaRecorderInstance.stop).toHaveBeenCalledTimes(1); 
    expect(mockAudioContextInstance.close).toHaveBeenCalledTimes(1);
  });

  // Test start/stop listening functionality
  test('Start and stop listening functionality', async () => {
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Initial state
    expect(screen.getByText('Start Listening')).toBeInTheDocument();
    
    // Start listening
    fireEvent.click(screen.getByText('Start Listening'));
    
    // Verify media access
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    
    // Verify listening state
    await waitFor(() => {
      expect(screen.getByText('Start Processing')).toBeInTheDocument();
    });
    
    // Stop listening
    fireEvent.click(screen.getByText('Start Processing'));
    
    // Verify stopped state
    await waitFor(() => {
      expect(screen.getByText('Start Listening')).toBeInTheDocument();
    });
  });
});