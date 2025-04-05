import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import './ErrorModal.css'; 

// Modal Component
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

export const ErrorModalProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const showErrorModal = useCallback((error) => {
    setError(error);
  }, []);

  const closeErrorModal = useCallback(() => {
    setError(null);
  }, []);

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
