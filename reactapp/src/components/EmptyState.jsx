import React from 'react';

const EmptyState = ({
  icon = '📭',
  title = 'No items found',
  description = 'There are no items matching your criteria at this moment.',
  actionText,
  onAction,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '420px' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onAction}
          style={{ marginTop: '0.5rem' }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
