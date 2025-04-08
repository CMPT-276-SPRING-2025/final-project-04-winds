import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import './ErrorModal.css'; 

// ErrorModal Component
// Displays the modal overlay and its content.
// Props:
// - error: An object that contains details about the error (e.g., context and message).
// - onClose: A callback function to dismiss the modal.
const ErrorModal = ({ error, onClose }) => (
  <div
    className="error-modal-overlay"
    role="alertdialog"
    aria-labelledby="error-title"
    aria-describedby="error-message"
  >
    <div className="error-modal">
      <h2 id="error-title">Oops! Something went wrong.</h2>
      <p id="error-message">
        {error.context && <span>{error.context}: </span>}
        {error.message}
      </p>
      <p>
        Please try refreshing the page or{' '}
        <a href="mailto:cookcompass100@gmail.com">contact support</a> if the issue persists.
      </p>
      <button onClick={onClose}>Dismiss</button>
    </div>
  </div>
);

// Context Setup
const ErrorModalContext = createContext();
// ErrorModalProvider Component
// Wraps the application components to provide access to modal control functions via context.
export const ErrorModalProvider = ({ children }) => {
  const [error, setError] = useState(null); // State variable to hold current error object; if null, no error modal is shown.

   // Function to show an error modal by setting the error state.
  const showErrorModal = useCallback((error) => {
    setError(error);
  }, []);

   // Function to close the error modal by clearing the error state.
  const closeErrorModal = useCallback(() => {
    setError(null);
  }, []);

  // Memoize context value to stop re-renders.
  const contextValue = useMemo(() => ({
    showErrorModal,
    closeErrorModal,
  }), [showErrorModal, closeErrorModal]);

  return (
    <ErrorModalContext.Provider value={contextValue}>
      {children}
      {error && <ErrorModal error={error} onClose={closeErrorModal} />}
    </ErrorModalContext.Provider>
  );
};

export const useErrorModal = () => useContext(ErrorModalContext);

export default ErrorModal;
