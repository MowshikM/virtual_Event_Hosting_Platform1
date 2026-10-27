import React from 'react';

const ErrorMessage = ({ message, onRetry, onClose }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      style={{
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        color: '#fca5a5',
        padding: '0.9rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⚠️</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {onRetry && (
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={onRetry}
            style={{
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#ffffff',
              padding: '0.3rem 0.65rem',
              fontSize: '0.8rem',
            }}
          >
            Retry
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss error"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fca5a5',
              cursor: 'pointer',
              fontSize: '1.1rem',
              lineHeight: 1,
              padding: '0.2rem',
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
