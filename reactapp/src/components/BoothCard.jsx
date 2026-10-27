import React from 'react';
import { useAuth } from '../context/AuthContext';

const BoothCard = ({
  booth,
  onVisit,
  onDropLead,
  onViewDetails,
  onEdit,
  onDelete,
  isActionLoading = false,
}) => {
  const { isAuthenticated, role } = useAuth();

 const canManage =
  isAuthenticated &&
  (
    role === 'ADMIN' ||
    role === 'ORGANIZER' ||
    role === 'SUPER_ADMIN' ||
    role === 'SPONSOR'
  );

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '1.35rem',
        gap: '0.85rem',
        borderTop: '3px solid var(--accent)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="badge badge-sponsor">🏢 Virtual Expo</span>
        <span className="badge badge-attendee">👀 {booth.visitCount || 0} Visits</span>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
        {booth.boothName}
      </h3>

      {booth.brandingConfig && (
        <div
          style={{
            background: 'rgba(236, 72, 153, 0.08)',
            border: '1px dashed rgba(236, 72, 153, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 0.85rem',
            fontSize: '0.85rem',
            color: 'var(--text-main)',
          }}
        >
          🎨 <em>{booth.brandingConfig}</em>
        </div>
      )}

      {booth.boothConfig && (
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.45, flex: 1 }}>
          {booth.boothConfig}
        </p>
      )}

      <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {booth.staffMembers && (
          <div>🧑‍💼 Staff: <span style={{ color: 'var(--text-muted)' }}>{booth.staffMembers}</span></div>
        )}
        <div>🎯 Leads Generated: <strong style={{ color: 'var(--secondary)' }}>{booth.leadCount || 0}</strong></div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginTop: 'auto',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(148, 163, 184, 0.08)',
        }}
      >
        {onVisit && (
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => onVisit(booth.id)}
            disabled={isActionLoading}
            style={{ flex: 1 }}
          >
            Visit Booth
          </button>
        )}

        {onDropLead && (
          <button
            type="button"
            className="btn btn-sm btn-accent"
            onClick={() => onDropLead(booth.id)}
            disabled={isActionLoading}
            style={{ flex: 1 }}
          >
            Drop Lead
          </button>
        )}
        {onViewDetails && (
  <button
    type="button"
    className="btn btn-sm btn-secondary"
    onClick={() => onViewDetails(booth)}
    disabled={isActionLoading}
    style={{ flex: 1 }}
  >
    👥 Visitors & Leads
  </button>
)}

        {canManage && (
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {onEdit && (
              <button
                type="button"
                className="btn btn-sm btn-secondary btn-icon"
                onClick={() => onEdit(booth)}
                title="Edit Booth"
                aria-label="Edit Booth"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="btn btn-sm btn-danger btn-icon"
                onClick={() => onDelete(booth)}
                title="Delete Booth"
                aria-label="Delete Booth"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoothCard;
