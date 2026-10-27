import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EventCard = ({ event, onEdit, onDelete }) => {  const { isAuthenticated, username, role, userId } = useAuth();

  const formattedDate = event.dateTime
    ? new Date(event.dateTime).toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Date TBA';

 

const registrationCount = event.registrationCount || 0;

  // Check if current user can manage this event
 const canManage =
  isAuthenticated &&
  (
    role === 'ADMIN' ||
    role === 'SUPER_ADMIN' ||
    (role === 'ORGANIZER' &&
      String(event.organizerId) === String(userId))
  );
  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Card Header Top Ribbon */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%)',
          padding: '1.25rem 1.25rem 1rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '0.75rem',
        }}
      >
        <span className="badge badge-attendee" style={{ fontSize: '0.7rem' }}>
          📅 {formattedDate}
        </span>
        {event.organizerName && (
          <span className="badge badge-organizer" style={{ fontSize: '0.7rem' }}>
            👤 {event.organizerName}
          </span>
        )}
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: '0.75rem',
        }}
      >
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.3,
          }}
        >
          <Link
            to={`/events/${event.id}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {event.title}
          </Link>
        </h3>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.description || 'No description provided for this virtual event.'}
        </p>

        {/* Info stats */}
       <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '0.5rem',
    borderTop: '1px solid rgba(148, 163, 184, 0.08)',
    fontSize: '0.85rem',
    color: 'var(--text-dim)',
  }}
>
  <span>👥 {registrationCount} Registered</span>


  {event.eventLink && (
    <span style={{ color: 'var(--secondary)' }}>
      🌐 Virtual Link
    </span>
  )}
</div>
      </div>

      {/* Card Actions Footer */}
      <div
        style={{
          padding: '1rem 1.25rem',
          background: 'rgba(11, 15, 25, 0.6)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <Link
          to={`/events/${event.id}`}
          className="btn btn-sm btn-outline"
          style={{ flex: 1, textAlign: 'center' }}
        >
          View Details
        </Link>

        

        {canManage && (
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {onEdit && (
              <button
                type="button"
                className="btn btn-sm btn-secondary btn-icon"
                onClick={() => onEdit(event)}
                title="Edit Event"
                aria-label="Edit Event"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="btn btn-sm btn-danger btn-icon"
                onClick={() => onDelete(event)}
                title="Delete Event"
                aria-label="Delete Event"
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

export default EventCard;
