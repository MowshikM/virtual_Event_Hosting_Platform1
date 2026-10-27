import React from 'react';
import { useAuth } from '../context/AuthContext';

const SessionCard = ({
  session,
  onJoinLive,
  onMarkAttendance,
   onViewAttendance,
  onOpenChat,
  onEdit,
  onDelete,
  isAttendanceMarked = false,
  isAttendanceLoading = false,
  canManageSession = false,
}) => {
  const { isAuthenticated, role } = useAuth();

  const formatDateTime = (dateTime) => {
  if (!dateTime) return 'TBA';

  const [datePart, timePart] = dateTime.split('T');

  if (!datePart || !timePart) return dateTime;

  const [year, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  );

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
  const timeRange = `${formatDateTime(session.startTime)} – ${formatDateTime(session.endTime)}`;


  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '1.35rem',
        gap: '0.85rem',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span className="badge badge-organizer">
          {session.sessionType || 'Session'}
        </span>
        {session.status && (
          <span
            className={`badge ${
              session.status.toUpperCase() === 'LIVE'
                ? 'badge-danger'
                : session.status.toUpperCase() === 'COMPLETED'
                ? 'badge-success'
                : 'badge-warning'
            }`}
          >
            {session.status.toUpperCase() === 'LIVE' ? '🔴 LIVE' : session.status}
          </span>
        )}
      </div>

      <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
        {session.title}
      </h4>

      {session.eventTitle && (
        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
          📌 Event: <strong>{session.eventTitle}</strong>
        </div>
      )}

      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span>🕒</span>
        <span>{timeRange}</span>
      </div>

      {session.description && (
        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            lineHeight: 1.45,
            flex: 1,
          }}
        >
          {session.description}
        </p>
      )}

      <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {session.moderatorName && (
          <div>🎙️ Moderator: <strong style={{ color: 'var(--text-main)' }}>{session.moderatorName}</strong></div>
        )}
        {session.speakerIds && (
          <div>👥 Speakers: <span style={{ color: 'var(--text-muted)' }}>{session.speakerIds}</span></div>
        )}
        {session.isRecorded && session.recordingUrl && (
          <div style={{ marginTop: '0.25rem' }}>
            <a
              href={session.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--secondary)', textDecoration: 'none' }}
            >
              🎥 View Recording
            </a>
          </div>
        )}
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
        {session.streamingConfig && onJoinLive && (
  <button
    type="button"
    className="btn btn-sm btn-primary"
    onClick={() => onJoinLive(session)}
    style={{ flex: 1, textAlign: 'center' }}
  >
    ▶ Join Stream
  </button>
)}

        {onOpenChat && (
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => onOpenChat(session)}
            style={{ flex: 1 }}
          >
            💬 Live Chat & Q&A
          </button>
        )}

        {isAuthenticated && role === 'ATTENDEE' && onMarkAttendance && (
          <button
            type="button"
            className={`btn btn-sm ${isAttendanceMarked ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => onMarkAttendance(session)}
            disabled={isAttendanceMarked || isAttendanceLoading}
          >
            {isAttendanceMarked ? '✓ Attended' : 'Mark Attendance'}
          </button>
        )}
       {isAuthenticated &&
  (role === 'ATTENDEE' ||
    role === 'ADMIN' ||
    role === 'SUPER_ADMIN' ||
    role === 'ORGANIZER') &&
  onViewAttendance && (
    <button
      type="button"
      className="btn btn-sm btn-outline"
      onClick={() => onViewAttendance(session)}
    >
      👥 Attendance
    </button>
)}

       {canManageSession && (
          <div style={{ display: 'flex', gap: '0.35rem', marginLeft: 'auto' }}>
            {onEdit && (
              <button
                type="button"
                className="btn btn-sm btn-secondary btn-icon"
                onClick={() => onEdit(session)}
                title="Edit Session"
                aria-label="Edit Session"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="btn btn-sm btn-danger btn-icon"
                onClick={() => onDelete(session)}
                title="Delete Session"
                aria-label="Delete Session"
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

export default SessionCard;
