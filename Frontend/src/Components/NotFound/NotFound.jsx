// import React from 'react';
import './NotFound.css';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="error-code">
        <span>4</span>
        <span className="zero">0</span>
        <span>4</span>
      </div>
      <div className="error-message">
        <h2>Oops! Page Not Found</h2>
        <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
      </div>
      <div className="error-actions">
        <Link to="/" className="btn-go-home">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
