import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
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
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⛔</div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>
        Access Restricted
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '440px', marginBottom: '2rem' }}>
        You do not have the required role privileges to access this area of the Virtual Event Platform.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
        <Link to="/events" className="btn btn-outline">
          Explore Public Events
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
