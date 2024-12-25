import React from "react";
import "./ErrorHandler.css";

const ErrorHandler = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="error-container">
      <div className="error-content">
        <h3>Error</h3>
        <p>{error.message || "An unexpected error occurred"}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ErrorHandler;
