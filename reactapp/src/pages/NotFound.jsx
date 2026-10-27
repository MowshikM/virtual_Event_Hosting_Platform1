import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          fontSize: '5rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          marginBottom: '1rem',
        }}
      >
        404
      </div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '440px', marginBottom: '2rem' }}>
        The virtual stage or resource you are searching for does not exist or has been moved to another track.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link to="/events" className="btn btn-primary">
          Browse Events
        </Link>
        <Link to="/dashboard" className="btn btn-outline">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
