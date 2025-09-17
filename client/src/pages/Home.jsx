import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home(){
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="logo-container">
          {/* You can replace this with your actual logo */}
          <svg className="logo" width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="company-name">Welcome to [Your Company Name]</h1>
        <p className="subtitle">Your one-stop solution for all your needs.</p>
        <div className="button-group">
          <Link to="/login" className="login-button">
            Login
          </Link>
          <Link to="/signup" className="signup-button">
            Sign Up
          </Link>
        </div>
      </div>
      <div className="background-shapes">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </div>
    </div>
  );
};

export default Home;