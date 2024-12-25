import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="spinner-overlay">
      <div className="spinner"></div>
      <p>Executing code...</p>
    </div>
  );
};

export default LoadingSpinner;
