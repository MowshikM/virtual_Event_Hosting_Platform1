import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import userService from '../services/userService';
import ErrorMessage from '../components/ErrorMessage';


const CreateEvent = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [formData, setFormData] = useState({
  title: '',
  description: '',
  dateTime: '',
  eventLink: '',
  organizerId: '',
});
const [organizers, setOrganizers] = useState([]);
const [organizerLoading, setOrganizerLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
  
  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Event title is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Event description is required';
    }
    if (!formData.dateTime) {
      errors.dateTime = 'Event date and time is required';
    }
    if (
  (role === 'ADMIN' || role === 'SUPER_ADMIN') &&
  !formData.organizerId
) {
  errors.organizerId = 'Please select an organizer';
}
if (!formData.eventLink.trim()) {
  errors.eventLink = 'Virtual streaming link is required';
} else {
  try {
    const url = new URL(formData.eventLink.trim());

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      errors.eventLink = 'Please enter a valid streaming URL';
    }
  } catch {
    errors.eventLink = 'Please enter a valid streaming URL';
  }

}
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
  attendees: [],
};

      const created = await eventService.createEvent(payload);
      navigate(`/events/${created.id}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create event. Please verify all details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
        <Link to="/events" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Events
        </Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Create New Event</span>
      </div>

      <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
            Host a New Virtual Event
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Configure your conference details, timing, and virtual streaming link.
          </p>
        </div>

        <ErrorMessage message={errorMessage} onClose={() => setErrorMessage('')} />

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="event-title">
              Event Title <span className="required">*</span>
            </label>
            <input
              id="event-title"
              name="title"
              type="text"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Global Tech Summit 2026"
              disabled={loading}
            />
            {formErrors.title && <div className="form-error">{formErrors.title}</div>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="event-desc">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="event-desc"
              name="description"
              className="form-textarea"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a comprehensive summary of agenda, keynote speakers, and themes..."
              disabled={loading}
            />
            {formErrors.description && <div className="form-error">{formErrors.description}</div>}
          </div>

          {/* Date & Time */}
          <div className="form-group">
            <label className="form-label" htmlFor="event-datetime">
              Date & Start Time <span className="required">*</span>
            </label>
            <input
              id="event-datetime"
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
    <label className="form-label" htmlFor="event-organizer">
      Event Host / Organizer <span className="required">*</span>
    </label>

    <select
      id="event-organizer"
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
            <label className="form-label" htmlFor="event-link">
              Virtual Streaming / Main Stage Link <span className="required">*</span>
            </label>
            <input
              id="event-link"
              name="eventLink"
              type="url"
              className="form-input"
              value={formData.eventLink}
              onChange={handleChange}
              placeholder="https://stream.example.com/live/stage-1"
              disabled={loading}
            />
            {formErrors.eventLink && (
  <div className="form-error">{formErrors.eventLink}</div>
)}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
            <Link to="/events" className="btn btn-secondary" disabled={loading}>
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating Event...' : '🚀 Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
