import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">
          Empowering Communities, <br /> One Report at a Time.
        </h1>
        <p className="home-subtitle">
          Notice a pothole, a broken streetlight, or overflowing garbage? 
          Be the change in your neighborhood. Report issues easily and track their resolution with CivicVoice.
        </p>
        <div className="home-buttons">
          <Link to="/dashboard" className="btn btn-primary">Report an Issue Now</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;