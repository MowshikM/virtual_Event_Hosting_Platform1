import React from 'react';

const LoadingSpinner = ({ text = 'Loading...', size = 'md', fullPage = false }) => {
  const spinnerSize = size === 'sm' ? '24px' : size === 'lg' ? '64px' : '44px';
  const borderWidth = size === 'sm' ? '2px' : '4px';

  const content = (
    <div
      className="loading-wrapper"
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: fullPage ? '20vh 1rem' : '2rem 1rem',
        gap: '0.85rem',
      }}
    >
      <div
        className="spinner"
        style={{
          width: spinnerSize,
          height: spinnerSize,
          borderWidth: borderWidth,
        }}
      />
      {text && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
