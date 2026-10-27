import React, { useEffect } from 'react';

const SuccessMessage = ({ message, onClose, autoClose = 5000 }) => {
  useEffect(() => {
    if (!message || !autoClose || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoClose);
    return () => clearTimeout(timer);
  }, [message, autoClose, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      style={{
        background: 'rgba(16, 185, 129, 0.12)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        color: '#6ee7b7',
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
        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>✅</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss success message"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6ee7b7',
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
  );
};

export default SuccessMessage;
