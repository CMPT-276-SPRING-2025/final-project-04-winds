// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

expect.extend({
    toHaveBeenCalledWithSanitized(received, expected) {
      // Safely sanitize URLs without breaking non-string arguments
      const sanitize = (arg) => {
        if (typeof arg !== 'string') return arg;
        return arg
          .replace(/([?&](key|apiKey|api_key)=)([^&]+)/g, '$1MOCK_KEY') // Handles ?key=, &apiKey=, etc.
      };
  
      const sanitizedCalls = received.mock.calls.map(call => [
        sanitize(call[0]), // First argument (URL)
        call[1]            // Second argument (options)
      ]);
  
      // Check if any call matches the expected arguments
      const pass = sanitizedCalls.some(call => 
        this.equals(call[0], expected[0]) && 
        this.equals(call[1], expected[1])
      );
  
      return {
        pass,
        message: () => `Expected sanitized call: ${this.utils.printExpected(expected)}\n` +
          `Received sanitized calls: ${this.utils.printReceived(sanitizedCalls)}`
      };
    }
  });