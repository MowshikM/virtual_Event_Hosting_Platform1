import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import roleRequestService from '../services/roleRequestService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

const Profile = () => {
  const { username, email, role } = useAuth();
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [createdDate, setCreatedDate] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    phoneNumber: '',
    profileData: '',
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [roleRequestLoading, setRoleRequestLoading] = useState(false);
  const [pendingRoleRequest, setPendingRoleRequest] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
  fetchProfile();
  fetchPendingRoleRequest();
}, [username]);
 const fetchProfile = async () => {
    try {
        setLoading(true);

        const user = await userService.getCurrentUser();

        setUserId(user.id);
        setCreatedDate(user.createdAt || user.createdDate);

        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            company: user.company || '',
            jobTitle: user.jobTitle || '',
            phoneNumber: user.phoneNumber || '',
            profileData: user.profileData || ''
        });
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
        setLoading(false);
    }
};
  const fetchPendingRoleRequest = async () => {
  try {
    const requests = await roleRequestService.getMyRequests();

    const pendingRequest = requests.find(
      (request) => request.status === 'PENDING'
    );

    setPendingRoleRequest(pendingRequest || null);
  } catch (err) {
    console.log('Role request fetch failed:', err);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'company', label: 'Company' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'phoneNumber', label: 'Phone Number' }
];

for (const field of requiredFields) {
    if (!formData[field.key] || !formData[field.key].trim()) {
        setError(`${field.label} is required.`);
        return;
    }
}
const phoneRegex = /^[6789]\d{9}$/;

if (!phoneRegex.test(formData.phoneNumber.trim())) {
  setError('Phone number must contain exactly 10 digits and start with 6, 7, 8, or 9.');
  return;
}
    if (!userId) {
      setError('Unable to update profile without user ID.');
      return;
    }

    setSaveLoading(true);
    setError('');
    setSuccess('');
    try {
      await userService.updateUser(userId, formData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaveLoading(false);
    }
  };
    const handleRoleRequest = async (requestedRole) => {
  setRoleRequestLoading(true);
  setError('');
  setSuccess('');

  try {
    const newRequest = await roleRequestService.createRequest(
      requestedRole,
      `I want to become an ${requestedRole === 'ORGANIZER' ? 'Organizer' : 'Sponsor'}.`
    );

    setPendingRoleRequest(newRequest);

    setSuccess(
      `${requestedRole === 'ORGANIZER' ? 'Organizer' : 'Sponsor'} role request submitted successfully.`
    );
    } catch (err) {
      setError(err.message || 'Failed to submit role request.');
    } finally {
      setRoleRequestLoading(false);
    }
  };

  return (
  <div style={{ maxWidth: '780px', margin: '0 auto' }}>
    
    <button
      type="button"
      onClick={() => navigate('/dashboard')}
      className="btn btn-secondary"
      style={{ marginBottom: '1rem' }}
    >
      ← Back to Dashboard
    </button>

    <div className="page-header">
        <div>
          <h1 className="page-title">User Profile & Account Settings</h1>
          <p className="page-subtitle">
            Manage your personal details, company credentials, and attendee profile.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <LoadingSpinner text="Loading profile details..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Account Overview Header */}
          <div
            className="glass-card"
            style={{
              padding: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  boxShadow: '0 0 20px var(--primary-glow)',
                }}
              >
                {username ? username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                  {username}
                </h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {email || 'Registered User'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
              <span className="badge badge-organizer" style={{ fontSize: '0.78rem' }}>
                Role: {role}
              </span>
              {createdDate && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Member since {new Date(createdDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
 {/* Role Request Section */}
{role === 'ATTENDEE' && (
  <div className="glass-card" style={{ padding: '2rem' }}>
    <h3
      style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        marginBottom: '0.75rem',
        color: '#ffffff',
      }}
    >
      Request a New Role
    </h3>

    {pendingRoleRequest ? (
      <>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            marginBottom: '1.25rem',
          }}
        >
          You already have a pending request for{' '}
          <strong>{pendingRoleRequest.requestedRole}</strong>.
          Please wait for the Admin or Super Admin to review your request.
        </p>

        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'rgba(255, 255, 255, 0.03)',
            marginBottom: '1rem',
          }}
        >
          <div style={{ fontWeight: 700 }}>
            Requested Role: {pendingRoleRequest.requestedRole}
          </div>

          <div
            style={{
              marginTop: '0.35rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
            }}
          >
            Status: PENDING
          </div>
        </div>
      </>
    ) : (
      <>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
          }}
        >
          You are currently an Attendee. To become an Organizer or Sponsor,
          submit a request for approval by an Admin or Super Admin.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleRoleRequest('ORGANIZER')}
            disabled={roleRequestLoading}
          >
            {roleRequestLoading
              ? 'Submitting...'
              : 'Request Organizer Role'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleRoleRequest('SPONSOR')}
            disabled={roleRequestLoading}
          >
            {roleRequestLoading
              ? 'Submitting...'
              : 'Request Sponsor Role'}
          </button>
        </div>
      </>
    )}
  </div>
)}

          {/* Profile Edit Form */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#ffffff' }}>
              Personal & Professional Information
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-firstname">
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    id="profile-firstname"
                    name="firstName"
                    type="text"
                    className="form-input"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Alex"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-lastname">
                   Last Name <span className="required">*</span>
                  </label>
                  <input
                    id="profile-lastname"
                    name="lastName"
                    type="text"
                    className="form-input"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Rivera"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-company">
                    Company / Institution <span className="required">*</span>
                  </label>
                  <input
                    id="profile-company"
                    name="company"
                    type="text"
                    className="form-input"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. CloudTech Solutions"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-jobtitle">
                  Job Title / Role <span className="required">*</span>
                  </label>
                  <input
                    id="profile-jobtitle"
                    name="jobTitle"
                    type="text"
                    className="form-input"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g. Principal Architect"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-phone">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  id="profile-phone"
                  name="phoneNumber"
                  type="tel"
                  className="form-input"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="6969678510"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-bio">
                  About / Bio Description
                </label>
                <textarea
                  id="profile-bio"
                  name="profileData"
                  className="form-textarea"
                  rows={4}
                  value={formData.profileData}
                  onChange={handleChange}
                  placeholder="Share a brief overview of your background, research interests, or networking goals..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saveLoading || !userId}
                >
                  {saveLoading ? 'Saving...' : '💾 Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
