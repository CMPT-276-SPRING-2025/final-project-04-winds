// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

window.HTMLElement.prototype.scrollIntoView = function() {};

expect.extend({
    toHaveBeenCalledWithSanitized(received, expected) {
      const sanitize = (arg) => {
        if (typeof arg !== 'string') return arg;
        return arg.replace(/([?&](key|apiKey|api_key)=)([^&]+)/g, '$1MOCK_KEY');
      };
  
      const sanitizedCalls = received.mock.calls.map(call => {
        // Handle cases where options might be undefined
        const options = call[1] || {};
        
        // Deep sanitize options.body if it exists
        if (options.body && typeof options.body === 'string') {
          try {
            const parsedBody = JSON.parse(options.body);
            options.body = JSON.stringify(parsedBody); // Normalize JSON formatting
          } catch (e) {
            // Not JSON, leave as-is
          }
        }
  
        return [
          sanitize(call[0]),
          options
        ];
      });
  
      // Find matching calls instead of just checking "some"
      const matchingCalls = sanitizedCalls.filter(call => 
        this.equals(call[0], expected[0]) && 
        this.equals(call[1], expected[1])
      );
  
      return {
        pass: matchingCalls.length > 0,
        message: () => {
          const printCall = (call) => `- ${this.utils.printReceived(call)}`;
          return [
            `Expected sanitized call: ${this.utils.printExpected(expected)}`,
            `Received ${sanitizedCalls.length} sanitized calls:`,
            ...sanitizedCalls.map(printCall)
          ].join('\n');
        }
      };
    }
  });