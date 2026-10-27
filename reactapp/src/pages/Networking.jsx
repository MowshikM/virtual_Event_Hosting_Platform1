import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import networkingService from '../services/networkingService';
import eventService from '../services/eventService';

import registrationService from '../services/registrationService';
import userService from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';

const Networking = () => {
const { username, role, userId } = useAuth();
  const [connections, setConnections] = useState([]);
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Request Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    eventId: '',
    recipientId: '',
    connectionType: 'COFFEE_CHAT',
    message: '',
    meetingTime: '',
  });
  const [modalLoading, setModalLoading] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [role]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [connectionsData, eventsData, registrationsData, usersData] = await Promise.all([
  (role === 'ADMIN' || role === 'SUPER_ADMIN')
    ? networkingService.getAllConnections()
    : networkingService.getMyConnections(),
  eventService.getAllEvents().catch(() => []),
  role === 'ATTENDEE'
    ? registrationService.getAllRegistrations().catch(() => [])
    : Promise.resolve([]),
  userService.getAllUsers().catch(() => [])
]);
     setConnections(connectionsData || []);
setEvents(eventsData || []);
setMyRegistrations(registrationsData || []);
setUsers(usersData || []);

      
    } catch (err) {
      setError(err.message || 'Failed to load networking connections.');
    } finally {
      setLoading(false);
    }
  };


  const handleOpenRequestModal = async () => {
  const firstEventId = events.length > 0 ? String(events[0].id) : '';

  setFormData({
    eventId: firstEventId,
    recipientId: '',
    connectionType: 'COFFEE_CHAT',
    message: '',
    meetingTime: '',
  });

  setRequestModalOpen(true);
};
const getConnectionStatus = (participantId) => {
  const matchingConnections = connections.filter(
    (c) =>
      (String(c.requesterId) === String(userId) &&
        String(c.recipientId) === String(participantId)) ||
      (String(c.requesterId) === String(participantId) &&
        String(c.recipientId) === String(userId))
  );

  const activeConnection = matchingConnections.find(
    (c) => ['PENDING', 'ACCEPTED'].includes(c.status)
  );

  if (activeConnection) {
    return activeConnection.status;
  }

  const rejectedConnection = matchingConnections.find(
    (c) => c.status === 'REJECTED'
  );

  return rejectedConnection ? rejectedConnection.status : null;
};

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!formData.eventId) {
      setError('Please select an event.');
      return;
    }
    if (!formData.recipientId) {
      setError('Please provide a recipient ID.');
      return;
    }

    setModalLoading(true);
    setError('');
    try {
      const payload = {
        eventId: Number(formData.eventId),
        recipientId: Number(formData.recipientId),
        connectionType: formData.connectionType,
        message: formData.message.trim(),
        meetingTime: formData.meetingTime || null,
      };

      const newConnection = await networkingService.requestConnection(payload);
      setConnections((prev) => [newConnection, ...prev]);
      setSuccess('Networking connection request sent successfully!');
      setRequestModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to send networking request.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleRespond = async (connectionId, status) => {
    setError('');
    try {
      const updated = await networkingService.respondToConnection(connectionId, status);
      setConnections((prev) =>
        prev.map((c) => (c.id === connectionId ? updated : c))
      );
      setSuccess(`Connection request ${status.toLowerCase()}ed.`);
    } catch (err) {
      setError(err.message || `Failed to ${status.toLowerCase()} request.`);
    }
  };

  const handleOpenDelete = (connection) => {
    setConnectionToDelete(connection);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!connectionToDelete) return;
    setDeleteLoading(true);
    try {
      await networkingService.deleteConnection(connectionToDelete.id);
      setConnections((prev) => prev.filter((c) => c.id !== connectionToDelete.id));
      setSuccess('Connection removed.');
      setDeleteModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete connection.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Group connections into incoming pending and established/sent
  // Group connections based on role
const isAdminView = role === 'ADMIN' || role === 'SUPER_ADMIN';

const incomingPending = isAdminView
  ? []
  : connections.filter(
      (c) => c.status === 'PENDING' && c.recipientName === username
    );

const otherConnections = isAdminView
  ? connections
  : connections.filter(
      (c) => !(c.status === 'PENDING' && c.recipientName === username)
    );

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">1-on-1 Attendee Networking Hub</h1>
          <p className="page-subtitle">
            Connect with fellow summit delegates, schedule virtual coffee chats, and expand your professional circle.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenRequestModal}>
          🤝 Send Connection Request
        </button>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} onRetry={fetchData} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <LoadingSpinner text="Loading networking connections..." />
      ) : (
        <>
          {/* Section 1: Incoming Pending Requests */}
          {incomingPending.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>
                📬 Action Required: Incoming Connection Requests ({incomingPending.length})
              </h3>
              <div className="grid-cards">
                {incomingPending.map((conn) => (
                  <div
                    key={conn.id}
                    className="glass-card"
                    style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span className="badge badge-accent">
                        {conn.connectionType || 'Networking'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {conn.createdDate ? new Date(conn.createdDate).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                      From: {conn.requesterName || 'Delegate'}
                    </h4>

                    {conn.eventTitle && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', margin: '0.25rem 0' }}>
                        📌 At: {conn.eventTitle}
                      </div>
                    )}

                    {conn.message && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0', fontStyle: 'italic' }}>
                        "{conn.message}"
                      </p>
                    )}

                    {conn.meetingTime && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '0.35rem' }}>
                        🕒 Proposed Time: {new Date(conn.meetingTime).toLocaleString()}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => handleRespond(conn.id, 'ACCEPTED')}
                        style={{ flex: 1 }}
                      >
                        ✓ Accept
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleRespond(conn.id, 'REJECTED')}
                        style={{ flex: 1 }}
                      >
                        ✕ Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: My Network & Outgoing Connections */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>
             {isAdminView
  ? `All Networking Connections (${otherConnections.length})`
  : `My Connections & Requests (${otherConnections.length})`}
            </h3>

            {otherConnections.length === 0 && incomingPending.length === 0 ? (
              <EmptyState
                icon="🤝"
                title="No connections yet"
                description="Start expanding your network by sending connection requests to attendees and speakers."
                actionText="Send Connection Request"
                onAction={handleOpenRequestModal}
              />
            ) : otherConnections.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No other connection records found.</p>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                     <th>Event</th>
{isAdminView ? (
  <>
    <th>Requester</th>
    <th>Receiver</th>
  </>
) : (
  <th>Partner</th>
)}
<th>Type</th>
<th>Proposed Time</th>
<th>Status</th>
<th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherConnections.map((c) => {
                      const isRequester = String(c.requesterId) === String(userId);
                      const partner = isRequester ? c.recipientName : c.requesterName;
                      return (
                        <tr key={c.id}>
                          <td>
                            <strong>{c.eventTitle || `Event #${c.eventId}`}</strong>
                          </td>
                          <td>
  {isAdminView ? (
    <span>
      👤 {c.requesterName || `User #${c.requesterId}`}
    </span>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <span>👤</span>
      <span>
        {partner ||
          (isRequester
            ? `User #${c.recipientId}`
            : `User #${c.requesterId}`)}
      </span>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        ({isRequester ? 'Outgoing' : 'Incoming'})
      </span>
    </div>
  )}
</td>

{isAdminView && (
  <td>
    👤 {c.recipientName || `User #${c.recipientId}`}
  </td>
)}
                          <td>
                            <span className="badge badge-attendee" style={{ fontSize: '0.7rem' }}>
                              {c.connectionType || 'Chat'}
                            </span>
                          </td>
                          <td>
                            {c.meetingTime ? new Date(c.meetingTime).toLocaleString() : 'Flexible'}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                c.status === 'ACCEPTED'
                                  ? 'badge-success'
                                  : c.status === 'REJECTED'
                                  ? 'badge-danger'
                                  : 'badge-warning'
                              }`}
                            >
                              {c.status === 'ACCEPTED'
  ? 'Connected'
  : c.status || 'PENDING'}
                            </span>
                          </td>
                          <td>
  {c.status === 'PENDING' && isRequester ? (
  <button
    type="button"
    className="btn btn-sm btn-secondary"
    onClick={() => handleOpenDelete(c)}
    title="Cancel Connection Request"
    aria-label="Cancel Connection Request"
  >
    Cancel Request
  </button>
) : c.status === 'ACCEPTED' ? (
  <span
    className="badge badge-success"
    style={{ padding: '0.45rem 0.7rem' }}
  >
    ✓ Connected
  </span>
) : (
  <button
    type="button"
    className="btn btn-sm btn-danger btn-icon"
    onClick={() => handleOpenDelete(c)}
    title="Delete Connection"
    aria-label="Delete Connection"
  >
    🗑️
  </button>
)}
</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Send Connection Request Modal */}
      {requestModalOpen && (
        <div className="modal-overlay" onClick={() => setRequestModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem', color: '#ffffff' }}>
              Request 1-on-1 Connection
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Propose a networking meeting or coffee chat during a virtual conference.
            </p>

            <form onSubmit={handleSendRequest}>
              <div className="form-group">
                <label className="form-label">Event <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={formData.eventId}
                 onChange={(e) => {
  const eventId = e.target.value;

  setFormData({
    ...formData,
    eventId,
    recipientId: '',
  });
}}
                  required
                >
                  <option value="">Select Event</option>
                  {(role === 'ATTENDEE'
  ? events.filter((ev) =>
      myRegistrations.some(
        (registration) =>
          String(registration.eventId) === String(ev.id)
      )
    )
  : events
).map((ev) => (
  <option key={ev.id} value={ev.id}>
    {ev.title}
  </option>
))}
                </select>
              </div>

              <div className="form-group">
  <label className="form-label">
    Select Participant <span className="required">*</span>
  </label>

  <select
    className="form-select"
    value={formData.recipientId}
    onChange={(e) =>
      setFormData({
        ...formData,
        recipientId: e.target.value,
      })
    }
    required
disabled={!formData.eventId}  >
    <option value="">
  {!formData.eventId ? 'Select an event first' : 'Select Participant'}
</option>

    {users
 .filter(
  (user) =>
    String(user.id) !== String(userId) &&
    ['ATTENDEE', 'ORGANIZER', 'SPONSOR'].includes(user.role) &&
    !['PENDING', 'ACCEPTED'].includes(
      getConnectionStatus(user.id)
    )
)
  .map((user) => (
    <option
      key={user.id}
      value={user.id}
    >
{user.firstName} {user.lastName} ({user.role})    </option>
  ))}
  </select>

  
</div>

              <div className="form-group">
                <label className="form-label">Connection Type</label>
                <select
                  className="form-select"
                  value={formData.connectionType}
                  onChange={(e) => setFormData({ ...formData, connectionType: e.target.value })}
                >
                  <option value="COFFEE_CHAT">☕ Virtual Coffee Chat</option>
                  <option value="SPEED_NETWORKING">⚡ Speed Networking</option>
                  <option value="BUSINESS_MEETING">💼 Business / Collaboration</option>
                  <option value="TECH_DISCUSSION">💻 Technical Discussion</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Proposed Meeting Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.meetingTime}
                  onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Introduction Note</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Introduce yourself and what you'd like to chat about..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRequestModalOpen(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Connection Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Remove Connection"
        message="Are you sure you want to remove this networking connection record?"
        confirmText="Remove"
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default Networking;
