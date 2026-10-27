import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import sessionService from '../services/sessionService';
import boothService from '../services/boothService';
import registrationService from '../services/registrationService';
import SessionCard from '../components/SessionCard';
import BoothCard from '../components/BoothCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import ConfirmModal from '../components/ConfirmModal';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, username, role, updateUserId } = useAuth();

  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'sessions' | 'booths'
  const [registrations, setRegistrations] = useState([]);
const [registrationsLoading, setRegistrationsLoading] = useState(false);

  // Registration Modal State (for ATTENDEE)
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    registrationType: 'STANDARD',
    paymentStatus: 'COMPLETED',
    paymentAmount: 0.0,
    customFields: '',
  });
  const [registerLoading, setRegisterLoading] = useState(false);

  // Delete Event Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const [eventData, sessionsData, boothsData] = await Promise.all([
  eventService.getEventById(id),
  sessionService.getSessionsByEvent(id).catch(() => []),
  boothService.getBoothsByEvent(id).catch(() => []),
]);

      setEvent(eventData);
      setSessions(sessionsData || []);
      setBooths(boothsData || []);
      if (
  isAuthenticated &&
  (
    role === 'ATTENDEE' ||
    role === 'ORGANIZER' ||
    role === 'ADMIN' ||
    role === 'SUPER_ADMIN'
  )
) {
  setRegistrationsLoading(true);

  try {
    const registrationData =
      await registrationService.getRegistrationsByEvent(id);

    setRegistrations(registrationData || []);
  } catch (err) {
    // Attendee who is not registered will receive 403.
    setRegistrations([]);
  } finally {
    setRegistrationsLoading(false);
  }
}
    } catch (err) {
      setError(err.message || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  

  const handleTicketRegister = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setRegisterLoading(true);
    setError('');
    try {
      const registered = await registrationService.register({
        eventId: Number(id),
        registrationType: registrationForm.registrationType,
        paymentStatus: registrationForm.paymentStatus,
        paymentAmount: Number(registrationForm.paymentAmount),
        customFields: registrationForm.customFields,
      });

      if (registered && registered.attendeeId && updateUserId) {
        updateUserId(registered.attendeeId);
      }

      setSuccess('Event ticket registered successfully! Pass added to your account.');
      setRegisterModalOpen(false);
      fetchEventDetails();
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await eventService.deleteEvent(id);
      navigate('/events', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to delete event.');
      setDeleteLoading(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading event details..." fullPage />;
  }

  if (!event) {
    return (
      <div>
        <ErrorMessage message={error || 'Event not found.'} />
        <Link to="/events" className="btn btn-secondary">
          ← Back to Events Catalog
        </Link>
      </div>
    );
  }

  
  const canManage =
  isAuthenticated &&
  (
    role === 'ADMIN' ||
    role === 'SUPER_ADMIN' ||
    (role === 'ORGANIZER' && event.organizerName === username)
  );

  const formattedDateTime = event.dateTime
  ? (() => {
      const [datePart, timePart] = event.dateTime.split('T');

      if (!datePart || !timePart) return event.dateTime;

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
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    })()
  : 'Date TBA';

  return (
    <div>
      {/* Breadcrumbs & Back */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
        <Link to="/events" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Events
        </Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{event.title}</span>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />

      {/* Hero Header Card */}
      <div
        className="glass-card"
        style={{
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(30, 41, 65, 0.8) 100%)',
          borderLeft: '5px solid var(--primary)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
              <span className="badge badge-organizer">📅 {formattedDateTime}</span>
              {event.organizerName && (
                <span className="badge badge-attendee">👤 Host: {event.organizerName}</span>
              )}
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
              {event.title}
            </h1>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            
{isAuthenticated && role === 'ATTENDEE' && (
    <button
      type="button"
      className="btn btn-primary"
      onClick={() => setRegisterModalOpen(true)}
    >
      🎟️ Register
    </button>
)}

            

            {canManage && (
              <>
                <Link to={`/events/${id}/edit`} className="btn btn-secondary">
                  ✏️ Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border)',
          marginBottom: '2rem',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          📄 Overview & Agenda
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`btn btn-sm ${activeTab === 'sessions' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          🎙️ Event Sessions ({sessions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('booths')}
          className={`btn btn-sm ${activeTab === 'booths' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          🏢 Expo Hall ({booths.length})
        </button>
        {isAuthenticated &&
  (role === 'ATTENDEE' ||
    role === 'ORGANIZER' ||
    role === 'ADMIN' ||
    role === 'SUPER_ADMIN') && (
    <button
      type="button"
      onClick={() => setActiveTab('registrations')}
      className={`btn btn-sm ${
        activeTab === 'registrations' ? 'btn-primary' : 'btn-outline'
      }`}
      style={{
        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
        borderBottom: 'none'
      }}
    >
      👥 Registered Attendees ({registrations.length})
    </button>
  )}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>
              About This Event
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {event.description || 'No detailed description provided for this virtual event.'}
            </p>

            {event.eventLink && (
              <div
                style={{
                  marginTop: '1.75rem',
                  padding: '1.25rem',
                  background: 'rgba(99, 102, 241, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff', marginBottom: '0.35rem' }}>
                  🌐 Virtual Main Stage Link
                </div>
                <a
                  href={event.eventLink.startsWith('http') ? event.eventLink : `https://${event.eventLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--secondary)', wordBreak: 'break-all', fontSize: '0.9rem' }}
                >
                  {event.eventLink}
                </a>
              </div>
            )}
          </div>

          
        </div>
      )}

      {/* Tab 2: Sessions */}
      {activeTab === 'sessions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Event Schedule & Keynotes</h3>
            {canManage && (
              <Link to="/sessions" className="btn btn-sm btn-primary">
                ➕ Schedule Session
              </Link>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="empty-state">
              <p style={{ color: 'var(--text-muted)' }}>No sessions have been scheduled for this event yet.</p>
            </div>
          ) : (
            <div className="grid-cards">
              {sessions.map((sess) => (
                <SessionCard key={sess.id} session={sess} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Virtual Booths */}
      {activeTab === 'booths' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Virtual Expo Hall</h3>
            {canManage && (
              <Link to="/booths" className="btn btn-sm btn-accent">
                ➕ Add Sponsor Booth
              </Link>
            )}
          </div>

          {booths.length === 0 ? (
            <div className="empty-state">
              <p style={{ color: 'var(--text-muted)' }}>No sponsor booths registered for this event yet.</p>
            </div>
          ) : (
            <div className="grid-cards">
              {booths.map((b) => (
                <BoothCard key={b.id} booth={b} />
              ))}
            </div>
          )}
        </div>
      )}
      {/* Tab 4: Registered Attendees */}
{activeTab === 'registrations' && (
  <div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}
    >
      <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
        Registered Attendees
      </h3>

      <span className="badge badge-attendee">
        {registrations.length} Registered
      </span>
    </div>

    {registrationsLoading ? (
      <LoadingSpinner text="Loading registered attendees..." />
    ) : registrations.length === 0 ? (
      <div className="empty-state">
        <p style={{ color: 'var(--text-muted)' }}>
          No registrations found for this event.
        </p>
      </div>
    ) : (
      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>
                #
              </th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>
                Attendee
              </th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>
                Registration Type
              </th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>
                Payment Status
              </th>
            </tr>
          </thead>

          <tbody>
            {registrations.map((registration, index) => (
              <tr key={registration.id}>
                <td style={{ padding: '0.75rem' }}>
                  {index + 1}
                </td>

                <td style={{ padding: '0.75rem' }}>
                  {registration.attendeeName || 'Unknown'}
                </td>

                <td style={{ padding: '0.75rem' }}>
                  {registration.registrationType || 'STANDARD'}
                </td>

                <td style={{ padding: '0.75rem' }}>
                  {registration.paymentStatus || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

      {/* Ticket Registration Modal */}
      {registerModalOpen && (
        <div className="modal-overlay" onClick={() => setRegisterModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>
              Register for {event.title}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Select your pass type to reserve your virtual seat.
            </p>

            <form onSubmit={handleTicketRegister}>
              <div className="form-group">
                <label className="form-label">Pass Type</label>
                <select
                  className="form-select"
                  value={registrationForm.registrationType}
                  onChange={(e) =>
                    setRegistrationForm({ ...registrationForm, registrationType: e.target.value })
                  }
                  required
                >
                  <option value="STANDARD">Standard Attendee Pass (Free)</option>
                  <option value="VIP">VIP All-Access Pass</option>
                  <option value="WORKSHOP">Workshop & Hands-on Pass</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Status</label>
                <select
                  className="form-select"
                  value={registrationForm.paymentStatus}
                  onChange={(e) =>
                    setRegistrationForm({ ...registrationForm, paymentStatus: e.target.value })
                  }
                >
                  <option value="COMPLETED">Completed</option>
                  <option value="FREE">Complimentary / Free</option>
                  <option value="PENDING">Pending Invoice</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Special Requests / Custom Notes</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={registrationForm.customFields}
                  onChange={(e) =>
                    setRegistrationForm({ ...registrationForm, customFields: e.target.value })
                  }
                  placeholder="e.g. Dietary preferences, networking interests, company details"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRegisterModalOpen(false)}
                  disabled={registerLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={registerLoading}>
                  {registerLoading ? 'Processing...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Event"
        message={`Are you sure you want to delete "${event.title}"?`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default EventDetails;
