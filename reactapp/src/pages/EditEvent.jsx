import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import eventService from '../services/eventService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

const [organizers, setOrganizers] = useState([]);
const [organizerLoading, setOrganizerLoading] = useState(false);

  const [formData, setFormData] = useState({
  title: '',
  description: '',
  dateTime: '',
  eventLink: '',
  organizerId: '',
  attendees: [],
});
  const [initialLoading, setInitialLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);
  useEffect(() => {
  const loadOrganizers = async () => {
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return;
    }

    setOrganizerLoading(true);

    try {
      const users = await userService.getAllUsers();

      const organizerUsers = users.filter(
        (user) => user.role === 'ORGANIZER'
      );

      setOrganizers(organizerUsers);
    } catch (err) {
      setErrorMessage('Failed to load organizers.');
    } finally {
      setOrganizerLoading(false);
    }
  };

  loadOrganizers();
}, [role]);

  const fetchEvent = async () => {
    setInitialLoading(true);
    try {
      const data = await eventService.getEventById(id);
      let dt = '';
      if (data.dateTime) {
        // Convert ISO to YYYY-MM-DDTHH:mm format for datetime-local input
        const d = new Date(data.dateTime);
        dt = d.toISOString().slice(0, 16);
      }
      setFormData({
  title: data.title || '',
  description: data.description || '',
  dateTime: dt,
  eventLink: data.eventLink || '',
  organizerId: data.organizerId ? String(data.organizerId) : '',
  attendees: data.attendees ? Array.from(data.attendees) : [],
});
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load event for editing.');
    } finally {
      setInitialLoading(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Event title is required';
    if (!formData.description.trim()) errors.description = 'Event description is required';
    if (!formData.dateTime) errors.dateTime = 'Event date and time is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
  title: formData.title.trim(),
  description: formData.description.trim(),
  dateTime: formData.dateTime,
  eventLink: formData.eventLink.trim(),
  organizerId: formData.organizerId
    ? Number(formData.organizerId)
    : null,
  attendees: formData.attendees,
};

      await eventService.updateEvent(id, payload);
      navigate(`/events/${id}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update event details.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner text="Loading event details..." fullPage />;
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
        <Link to="/events" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Events
        </Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <Link to={`/events/${id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          {formData.title || 'Event'}
        </Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Edit</span>
      </div>

      <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
            Edit Virtual Event
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Update event scheduling, agenda description, and stage links.
          </p>
        </div>

        <ErrorMessage message={errorMessage} onClose={() => setErrorMessage('')} />

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-event-title">
              Event Title <span className="required">*</span>
            </label>
            <input
              id="edit-event-title"
              name="title"
              type="text"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
            />
            {formErrors.title && <div className="form-error">{formErrors.title}</div>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-event-desc">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="edit-event-desc"
              name="description"
              className="form-textarea"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
            {formErrors.description && <div className="form-error">{formErrors.description}</div>}
          </div>

          {/* Date & Time */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-event-datetime">
              Date & Start Time <span className="required">*</span>
            </label>
            <input
              id="edit-event-datetime"
              name="dateTime"
              type="datetime-local"
              className="form-input"
              value={formData.dateTime}
              onChange={handleChange}
              disabled={loading}
            />
            {formErrors.dateTime && <div className="form-error">{formErrors.dateTime}</div>}
          </div>
          {/* Event Host / Organizer */}
{(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
  <div className="form-group">
    <label className="form-label" htmlFor="edit-event-organizer">
      Event Host / Organizer <span className="required">*</span>
    </label>

    <select
      id="edit-event-organizer"
      name="organizerId"
      className="form-input"
      value={formData.organizerId}
      onChange={handleChange}
      disabled={loading || organizerLoading}
    >
      <option value="">
        {organizerLoading
          ? 'Loading organizers...'
          : 'Select an Organizer'}
      </option>

      {organizers.map((organizer) => (
        <option key={organizer.id} value={organizer.id}>
          {organizer.username}
        </option>
      ))}
    </select>

    {formErrors.organizerId && (
      <div className="form-error">
        {formErrors.organizerId}
      </div>
    )}
  </div>
)}

          {/* Virtual Meeting Link */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-event-link">
              Virtual Streaming Link
            </label>
            <input
              id="edit-event-link"
              name="eventLink"
              type="url"
              className="form-input"
              value={formData.eventLink}
              onChange={handleChange}
              placeholder="https://..."
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
            <Link to={`/events/${id}`} className="btn btn-secondary" disabled={loading}>
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving Changes...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;
