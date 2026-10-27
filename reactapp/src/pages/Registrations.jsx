import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import registrationService from '../services/registrationService';
import eventService from '../services/eventService';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';

const Registrations = () => {
const { username, role, userId } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Cancel Registration Modal (Admin only)
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [regToCancel, setRegToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [role, username]);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError('');
    try {
      const [regsData, eventsData] = await Promise.all([
        registrationService.getAllRegistrations(),
        eventService.getAllEvents().catch(() => []),
      ]);

      setRegistrations(regsData || []);
      setEvents(eventsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load registration data.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = useMemo(() => {
    let list = [...registrations];

    // For Attendee, only show their registrations if not Admin/Organizer
    if (role === 'ATTENDEE') {
      list = list.filter((r) => r.attendeeName === username);
    }

    return list.filter((r) => {
      const matchesSearch =
        searchKeyword === '' ||
        (r.eventTitle && r.eventTitle.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (r.attendeeName && r.attendeeName.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (r.registrationType && r.registrationType.toLowerCase().includes(searchKeyword.toLowerCase()));

      const matchesEvent =
        selectedEventId === 'ALL' || String(r.eventId) === String(selectedEventId);

      const matchesType =
        selectedType === 'ALL' || r.registrationType === selectedType;

      return matchesSearch && matchesEvent && matchesType;
    });
  }, [registrations, role, username, searchKeyword, selectedEventId, selectedType]);

  const paginatedRegistrations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRegistrations.slice(start, start + pageSize);
  }, [filteredRegistrations, currentPage, pageSize]);

  const handleOpenCancel = (reg) => {
    setRegToCancel(reg);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!regToCancel) return;
    setCancelLoading(true);
    try {
      await registrationService.cancelRegistration(regToCancel.id);
      setRegistrations((prev) => prev.filter((r) => r.id !== regToCancel.id));
      setSuccess('Registration canceled successfully.');
      setCancelModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to cancel registration.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {role === 'ATTENDEE' ? 'My Event Passes & Tickets' : 'Event Registrations Roster'}
          </h1>
          <p className="page-subtitle">
            {role === 'ATTENDEE'
              ? 'View all confirmed conference registrations and virtual access credentials.'
              : 'Monitor delegate signups, pass tiers, and ticket issuance across virtual events.'}
          </p>
        </div>

        {role === 'ATTENDEE' && (
          <Link to="/events" className="btn btn-primary">
            🎟️ Browse More Events
          </Link>
        )}
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} onRetry={fetchRegistrations} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />

      <div className="control-bar">
        <SearchBar
          value={searchKeyword}
          onChange={(val) => {
            setSearchKeyword(val);
            setCurrentPage(1);
          }}
          onClear={() => setSearchKeyword('')}
          placeholder="Search by event, attendee name or pass tier..."
          style={{ maxWidth: '380px' }}
        />

        <div className="filters-group">
{events.length > 0 &&
  (role === 'ADMIN' ||
    role === 'SUPER_ADMIN' ||
    role === 'ORGANIZER') && (            <select
              className="form-select"
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: 'auto', minWidth: '160px' }}
              aria-label="Filter registrations by event"
            >
              <option value="ALL">All Events</option>
             {events
  .filter((ev) =>
    role === 'ORGANIZER'
      ? String(ev.organizerId) === String(userId)
      : true
  )
  .map((ev) => (
    <option key={ev.id} value={ev.id}>
      {ev.title}
    </option>
  ))}
            </select>
          )}

          <select
            className="form-select"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 'auto', minWidth: '140px' }}
            aria-label="Filter registrations by type"
          >
            <option value="ALL">All Tiers</option>
            <option value="STANDARD">Standard Pass</option>
            <option value="VIP">VIP Access</option>
            <option value="WORKSHOP">Workshop Pass</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching registration records..." />
      ) : paginatedRegistrations.length === 0 ? (
        <EmptyState
          icon="🎫"
          title="No registrations found"
          description={
            role === 'ATTENDEE'
              ? 'You have not registered for any events yet. Explore our events catalog to claim your pass!'
              : 'No delegate registration records match your filter criteria.'
          }
          actionText={role === 'ATTENDEE' ? 'Explore Events' : undefined}
          onAction={role === 'ATTENDEE' ? () => {} : undefined}
        />
      ) : (
        <>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Pass ID</th>
                  <th>Event Title</th>
                  {role !== 'ATTENDEE' && <th>Delegate</th>}
                  <th>Registration Tier</th>
                  <th>Payment Status</th>
                  <th>Registered On</th>
                  <th>Custom Notes</th>
                  {(role === 'ATTENDEE' ||
  role === 'ORGANIZER' ||
  role === 'ADMIN' ||
  role === 'SUPER_ADMIN') && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedRegistrations.map((reg) => (
                  <tr key={reg.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        #{reg.id}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#ffffff' }}>
                        <Link
                          to={`/events/${reg.eventId}`}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {reg.eventTitle || `Event #${reg.eventId}`}
                        </Link>
                      </strong>
                    </td>
                    {role !== 'ATTENDEE' && (
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>👤</span>
                          <span>{reg.attendeeName || `User #${reg.attendeeId}`}</span>
                        </div>
                      </td>
                    )}
                    <td>
                      <span
                        className={`badge ${
                          reg.registrationType === 'VIP'
                            ? 'badge-accent'
                            : reg.registrationType === 'WORKSHOP'
                            ? 'badge-organizer'
                            : 'badge-attendee'
                        }`}
                      >
                        {reg.registrationType || 'STANDARD'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          reg.paymentStatus === 'COMPLETED' || reg.paymentStatus === 'FREE'
                            ? 'badge-success'
                            : 'badge-warning'
                        }`}
                      >
                        {reg.paymentStatus || 'FREE'}
                      </span>
                    </td>
                    <td>
                      {reg.registrationDate
                        ? new Date(reg.registrationDate).toLocaleDateString()
                        : 'Confirmed'}
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {reg.customFields || '—'}
                    </td>
                    {(role === 'ATTENDEE' ||
  role === 'ORGANIZER' ||
  role === 'ADMIN' ||
  role === 'SUPER_ADMIN') && (
  <td>
    <button
      type="button"
      className="btn btn-sm btn-danger btn-icon"
      onClick={() => handleOpenCancel(reg)}
      title="Cancel Registration"
      aria-label="Cancel Registration"
    >
      🗑️
    </button>
  </td>
)}
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredRegistrations.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            itemLabel="registrations"
          />
        </>
      )}

      {/* Cancel Modal (Admin only) */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        title="Cancel Registration"
       message={
  role === 'ATTENDEE'
    ? `Are you sure you want to cancel your registration for "${regToCancel?.eventTitle}"?`
    : `Are you sure you want to cancel registration #${regToCancel?.id} for "${regToCancel?.attendeeName}"?`
}
        confirmText="Cancel Pass"
        confirmVariant="danger"
        loading={cancelLoading}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
};

export default Registrations;
