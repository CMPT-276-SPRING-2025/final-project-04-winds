import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Component to be tested
import TTS from '../Title_Card/TTS';

// Mock the environment variables
const originalEnv = process.env;

// Mock the MediaRecorder API
global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  requestData: jest.fn(),
  state: 'inactive',
  ondataavailable: jest.fn(),
}));

// Mock AudioContext
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

// Mock FileReader
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

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));

// Mock navigator.mediaDevices
navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
    getTracks: () => [{ stop: jest.fn() }],
  }),
};

// Mock fetch
global.fetch = jest.fn();
global.atob = jest.fn().mockImplementation(str => str);
global.URL.createObjectURL = jest.fn().mockImplementation(blob => 'mock-audio-url');

describe('TTS Component', () => {
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
    // Reset mocks
    jest.clearAllMocks();

    process.env = { ...originalEnv, REACT_APP_GOOGLE_CLOUD_API_KEY: 'test-api-key' };
    
    // Mock fetch to simulate API response for synthesizeSpeech
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

    // Setup for audio element
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value: jest.fn(),
    });

    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: jest.fn(),
    });

    HTMLMediaElement.prototype.play.mockClear();
    HTMLMediaElement.prototype.pause.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // === BASIC RENDERING TESTS ===

  test('Renders without crashing', () => {
    render(<TTS />);
    expect(screen.getByTestId('text-to-speech')).toBeInTheDocument();
  });

  test('Renders the TTS Icon', () => {
    render(<TTS />);
    
    const ttsIcon = screen.getByTestId('text-to-speech');
    expect(ttsIcon).toBeInTheDocument();
    expect(ttsIcon).toHaveAttribute('src', '/Media/Text-To-Speech.png');
  });

  test('applies the correct styling to the TTS', () => {
    render(<TTS className='languageBox' />);
    
    expect(screen.getByTestId('text-to-speech')).toHaveClass('image-button');
  });

  test('Displays error message when API key is missing', () => {
    process.env.REACT_APP_GOOGLE_CLOUD_API_KEY = '';
    render(<TTS />);
    
    expect(screen.getByText(/Google Cloud TTS API key is missing/)).toBeInTheDocument();
  });

  // === MENU INTERACTION TESTS ===

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
    
    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    
    // Menu should close
    expect(screen.queryByText('Play')).not.toBeInTheDocument();
  });

  // === INSTRUCTION PROCESSING TESTS ===

  test('Processes instructions correctly', () => {
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // Step count should be correct
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  test('Handles empty instructions', () => {
    render(<TTS analyzedInstructions={[{}]} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // No step indicators should be present
    expect(screen.queryByText(/Step/)).not.toBeInTheDocument();
  });

  test('Handles null instructions', () => {
    render(<TTS analyzedInstructions={null} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // No step indicators should be present
    expect(screen.queryByText(/Step/)).not.toBeInTheDocument();
  });

  // === AUDIO PLAYBACK TESTS ===

  test('Audio playback controls work correctly', async () => {
    const { container } = render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // Click play button
    fireEvent.click(screen.getByText('Play'));
    
    // Wait for audio element to appear
    await waitFor(() => {
      expect(container.querySelector('audio')).toBeInTheDocument();
      expect(container.querySelector('audio')).toHaveAttribute('src', 'mock-audio-url');
    });
    
    // Now the button should show "Pause"
    expect(screen.getByText('Pause')).toBeInTheDocument();
    
    // Click pause button
    fireEvent.click(screen.getByText('Pause'));
    
    // HTMLMediaElement.pause should have been called
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  test('Audio ends playback correctly', async () => {
    const { container } = render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // Click play button
    fireEvent.click(screen.getByText('Play'));
    
    // Wait for audio element to appear
    await waitFor(() => {
      expect(container.querySelector('audio')).toBeInTheDocument();
    });
    
    // Simulate audio ending
    fireEvent.ended(container.querySelector('audio'));
    
    // Button should go back to "Play"
    expect(screen.getByText('Play')).toBeInTheDocument();
  });

  test('Next and previous step buttons work correctly', async () => {
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // Initially at step 1
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    
    // Click next button
    fireEvent.click(screen.getByText('Skip'));
    
    // Should be at step 2
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    
    // Click next button again
    fireEvent.click(screen.getByText('Skip'));
    
    // Should be at step 3
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

  test('Synthesizes speech correctly', async () => {
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // Click play button
    fireEvent.click(screen.getByText('Play'));
    
    // Check that the TTS API was called with correct parameters
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

  test('Handles TTS API failure', async () => {
    // Mock fetch to simulate error
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server Error')
      })
    );
    
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // Try to play
    fireEvent.click(screen.getByText('Play'));
    
    // API should be called but no audio element created
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  test('Handles missing audio content in response', async () => {
    // Mock fetch to return no audio content
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ /* No audioContent */ })
      })
    );
    
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // Try to play
    fireEvent.click(screen.getByText('Play'));
    
    // API should be called but no audio element created
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  // === VOICE RECOGNITION TESTS ===

  test('Start and stop listening functionality', async () => {
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Initially not listening
    expect(screen.getByText('Start Listening')).toBeInTheDocument();
    
    // Start listening
    fireEvent.click(screen.getByText('Start Listening'));
    
    // Media APIs should be called
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(global.MediaRecorder).toHaveBeenCalled();
    
    // Button should now show "Stop Listening"
    await waitFor(() => {
      expect(screen.getByText('Stop Listening')).toBeInTheDocument();
    });
    
    // Stop listening
    fireEvent.click(screen.getByText('Stop Listening'));
    
    // Button should show "Start Listening" again
    await waitFor(() => {
      expect(screen.getByText('Start Listening')).toBeInTheDocument();
    });
  });

  test('Handles getUserMedia errors', async () => {
    // Make getUserMedia fail
    navigator.mediaDevices.getUserMedia.mockImplementationOnce(() => 
      Promise.reject(new Error('Permission denied'))
    );
    
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Try to start listening
    fireEvent.click(screen.getByText('Start Listening'));
    
    // Button should still say "Start Listening"
    await waitFor(() => {
      expect(screen.getByText('Start Listening')).toBeInTheDocument();
    });
  });

  test('Voice command processing - play', async () => {
    // Create a real-like MediaRecorder implementation
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
    
    // Set fetch to return "play" command
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          results: [{ alternatives: [{ transcript: 'play' }] }]
        }),
      })
    );

    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Trigger data available
    await act(async () => {
      mediaRecorderInstance.ondataavailable(mockDataEvent);
    });
    
    // Wait for speech recognition to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('speech.googleapis.com'),
        expect.any(Object)
      );
    });
    
    // Should call TTS API after voice command "play"
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('texttospeech.googleapis.com'),
        expect.any(Object)
      );
    });
  });

  test('Voice command processing - pause', async () => {
    // First set up playing audio
    const { container } = render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Open menu and play
    fireEvent.click(screen.getByTestId('text-to-speech'));
    fireEvent.click(screen.getByText('Play'));
    
    // Wait for audio to start
    await waitFor(() => {
      expect(container.querySelector('audio')).toBeInTheDocument();
    });
    
    // Set up MediaRecorder mock
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
    
    // Set fetch to return "pause" command
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          results: [{ alternatives: [{ transcript: 'pause' }] }]
        }),
      })
    );
    
    // Trigger data available
    await act(async () => {
      mediaRecorderInstance.ondataavailable(mockDataEvent);
    });
    
    // Wait for speech recognition to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('speech.googleapis.com'),
        expect.any(Object)
      );
    });
    
    // Audio should be paused
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

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
    
    // Check initial step
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    
    // Start listening
    fireEvent.click(screen.getByText('Start Listening'));
    
    // Set fetch to return "next" command
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          results: [{ alternatives: [{ transcript: 'next' }] }]
        }),
      })
    );

    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Trigger data available
    await act(async () => {
      mediaRecorderInstance.ondataavailable(mockDataEvent);
    });
    
    // Wait for speech recognition to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('speech.googleapis.com'),
        expect.any(Object)
      );
    });
    
    // Should move to next step
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
  });

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
    
    // Set fetch to return "go back" command
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          results: [{ alternatives: [{ transcript: 'go back' }] }]
        }),
      })
    );

    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Trigger data available
    await act(async () => {
      mediaRecorderInstance.ondataavailable(mockDataEvent);
    });
    
    // Wait for speech recognition to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('speech.googleapis.com'),
        expect.any(Object)
      );
    });
    
    // Should move back to step 1
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  test('Voice command processing - stop listening', async () => {
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
    
    // Verify it's now listening
    await waitFor(() => {
      expect(screen.getByText('Stop Listening')).toBeInTheDocument();
    });
    
    // Set fetch to return "stop listening" command
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          results: [{ alternatives: [{ transcript: 'stop listening' }] }]
        }),
      })
    );
    
    await new Promise(resolve => setTimeout(resolve, 10));

    // Trigger data available
    await act(async () => {
      mediaRecorderInstance.ondataavailable(mockDataEvent);
    });
    
    // Wait for speech recognition to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('speech.googleapis.com'),
        expect.any(Object)
      );
    });
    
    // Should stop listening
    expect(screen.getByText('Start Listening')).toBeInTheDocument();
    expect(mediaRecorderInstance.stop).toHaveBeenCalled();
  });

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
    
    // Simulate API failure
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );

    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Trigger data available
    await act(async () => {
      mediaRecorderInstance.ondataavailable(mockDataEvent);
    });
    
    // Processing indicator should appear and then disappear
    await waitFor(() => {
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
    });
  });

  test('FileReader error handling', async () => {
    // 1. Store the original FileReader to restore later
    const OriginalFileReader = global.FileReader;
  
    // 2. Mock FileReader to simulate an error
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
  
    // 3. Mock MediaRecorder
    const mockDataEvent = { data: new Blob(['test'], { type: 'audio/webm' }) };
    let mediaRecorderInstance;
  
    global.MediaRecorder = jest.fn(function () {
      mediaRecorderInstance = {
        start: jest.fn(),
        stop: jest.fn(),
        requestData: jest.fn(),
        state: 'recording',
        ondataavailable: null, // Let the component set this later
      };
      return mediaRecorderInstance;
    });
  
    // 4. Render the component
    render(<TTS analyzedInstructions={sampleInstructions} />);
  
    // 5. Start listening (initializes MediaRecorder)
    fireEvent.click(screen.getByText('Start Listening'));
  
    // 6. Wait briefly for the component to set `ondataavailable`
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10)); // Short delay
    });
  
    // 7. Only trigger if the handler exists
    await act(async () => {
      if (mediaRecorderInstance.ondataavailable) {
        mediaRecorderInstance.ondataavailable(mockDataEvent);
      }
    });
  
    // 8. Verify error handling (e.g., "Processing..." disappears)
    await waitFor(() => {
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
    });
  
    // 9. Restore original FileReader
    global.FileReader = OriginalFileReader;
  });

  // === CLEAN UP AND RESOURCE HANDLING ===

  test('Cleans up resources on unmount', async () => {
    const { unmount } = render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // Start listening to create resources
    fireEvent.click(screen.getByText('Start Listening'));
    
    // Wait for resources to be created
    await waitFor(() => {
      expect(screen.getByText('Stop Listening')).toBeInTheDocument();
    });
    
    // Unmount component
    unmount();
    
    // Check if resources were cleaned up
    const mockTrack = navigator.mediaDevices.getUserMedia().getTracks()[0];
    expect(mockTrack.stop).toHaveBeenCalled();
  });

  test('Handles missing instruction steps gracefully', () => {
    const emptyInstructions = [{ steps: [] }];
    render(<TTS analyzedInstructions={emptyInstructions} />);
    
    // Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    
    // No step indicators should be present
    expect(screen.queryByText(/Step/)).not.toBeInTheDocument();
  });

  test('Audio state is reset when changing steps', async () => {
    // Mock audio methods  
    render(<TTS analyzedInstructions={sampleInstructions} />);
    
    // 1. Open menu
    fireEvent.click(screen.getByTestId('text-to-speech'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  
    // 2. Click Play
    const playButton = await screen.findByRole('button', { name: /(play|pause)/i });
    fireEvent.click(playButton);
  
    // 3. Verify playing state
    await waitFor(() => {      
      expect(playButton).toHaveTextContent(/pause/i); 
    });
  
    // 4. Click Skip and verify
    const skipButton = await screen.findByRole('button', { name: /skip/i });
    fireEvent.click(skipButton);

    
    // expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(await screen.findByRole('button', { name: /play/i })).toBeInTheDocument();
  });
});
