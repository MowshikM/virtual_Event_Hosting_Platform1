import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
   
  });
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
    setSuccessMessage('');

    if (!validate()) return;

    setLoading(true);
    try {
      await register({
  username: formData.username.trim(),
  email: formData.email.trim(),
  password: formData.password,
});

      setSuccessMessage('User registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '1.5rem 1rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '2.5rem 2rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              boxShadow: '0 0 20px var(--accent-glow)',
            }}
          >
            ✨
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.35rem' }}>
            Join the Virtual Event Platform ecosystem
          </p>
        </div>

        <ErrorMessage message={errorMessage} onClose={() => setErrorMessage('')} />
        <SuccessMessage message={successMessage} onClose={() => setSuccessMessage('')} />

        <form onSubmit={handleSubmit} noValidate>
          {/* Username Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-username">
              Username <span className="required">*</span>
            </label>
            <input
              id="register-username"
              name="username"
              type="text"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. alex_rivera"
              disabled={loading}
              autoComplete="username"
            />
            {formErrors.username && <div className="form-error">{formErrors.username}</div>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Email Address <span className="required">*</span>
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              disabled={loading}
              autoComplete="email"
            />
            {formErrors.email && <div className="form-error">{formErrors.email}</div>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Password <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
  <input
    id="register-password"
    name="password"
    type={showPassword ? 'text' : 'password'}
    className="form-input"
    value={formData.password}
    onChange={handleChange}
    placeholder="Create a strong password"
    disabled={loading}
    autoComplete="new-password"
    style={{ paddingRight: '3rem' }}
  />

  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    disabled={loading}
    aria-label={showPassword ? 'Hide password' : 'Show password'}
    style={{
      position: 'absolute',
      right: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      fontSize: '1.1rem',
      padding: '0.25rem',
    }}
  >
    {showPassword ? '🙈' : '👁️'}
  </button>
</div>
            {formErrors.password && <div className="form-error">{formErrors.password}</div>}
          </div>

          

          <button
            type="submit"
            className="btn btn-accent"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border)',
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
