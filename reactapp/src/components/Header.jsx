import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, username, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'ADMIN':
        return 'badge-admin';
      case 'ORGANIZER':
        return 'badge-organizer';
      case 'ATTENDEE':
        return 'badge-attendee';
      case 'SPONSOR':
        return 'badge-sponsor';
      default:
        return 'badge-outline';
    }
  };

  return (
    <header className="glass-header">
      <div
        style={{
          maxWidth: '1380px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Brand Logo */}
        <Link
          to={isAuthenticated ? '/dashboard' : '/events'}
          onClick={closeMenu}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              boxShadow: '0 0 15px var(--primary-glow)',
            }}
          >
            ⚡
          </div>
          <div>
            <span
              style={{
  fontFamily: 'Outfit',
  fontSize: '1.25rem',
  fontWeight: 800,
  color: '#172554',
  letterSpacing: '-0.02em',
  display: 'block',
  lineHeight: 1.1,
}}
            >
              EventVerse
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 600,
              }}
            >
              Virtual Hosting Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          className="desktop-nav"
        >
          {isAuthenticated && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              Dashboard
            </NavLink>
          )}

          <NavLink
            to="/events"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            Events
          </NavLink>

          <NavLink
            to="/sessions"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            Sessions
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink
                to="/booths"
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                Expo Booths
              </NavLink>

              <NavLink
                to="/networking"
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                Networking
              </NavLink>

              <NavLink
                to="/registrations"
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                {role === 'ATTENDEE' ? 'My Passes' : 'Registrations'}
              </NavLink>

{(role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'ORGANIZER' || role === 'SPONSOR') && (                
  <NavLink
                  to="/analytics"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  Analytics
                </NavLink>
              )}

              {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  Users
                </NavLink>
              )}
            </>
          )}
        </nav>

        {/* Desktop User Section */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1rem',
          }}
          className="desktop-user"
        >
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  textDecoration: 'none',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border)',
                  transition: 'var(--transition)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {username}
                </span>
                <span className={`badge ${getRoleBadgeClass()}`} style={{ fontSize: '0.65rem' }}>
                  {role}
                </span>
              </Link>

              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={handleLogout}
                style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link to="/login" className="btn btn-sm btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-main)',
            fontSize: '1.25rem',
            padding: '0.5rem 0.75rem',
            cursor: 'pointer',
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'rgba(11, 15, 25, 0.98)',
            borderBottom: '1px solid var(--border)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            animation: 'slideUp 0.2s ease-out',
          }}
          className="mobile-menu"
        >
          {isAuthenticated && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.85rem',
                borderBottom: '1px solid var(--border)',
                marginBottom: '0.25rem',
              }}
            >
              <Link
                to="/profile"
                onClick={closeMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                >
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {username}
                  </div>
                  <span className={`badge ${getRoleBadgeClass()}`} style={{ fontSize: '0.65rem' }}>
                    {role}
                  </span>
                </div>
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <NavLink
              to="/dashboard"
              onClick={closeMenu}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            >
              📊 Dashboard
            </NavLink>
          )}

          <NavLink
            to="/events"
            onClick={closeMenu}
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          >
            🎟️ Browse Events
          </NavLink>

          <NavLink
            to="/sessions"
            onClick={closeMenu}
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
          >
            🗓️ Sessions
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink
                to="/booths"
                onClick={closeMenu}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                🏢 Expo Booths
              </NavLink>

              <NavLink
                to="/networking"
                onClick={closeMenu}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                🤝 Networking
              </NavLink>

              <NavLink
                to="/registrations"
                onClick={closeMenu}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                🎫 {role === 'ATTENDEE' ? 'My Passes' : 'Registrations'}
              </NavLink>

{(role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'ORGANIZER' || role === 'SPONSOR') && (                <NavLink
                  to="/analytics"
                  onClick={closeMenu}
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                >
                  📈 Analytics
                </NavLink>
              )}

              {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                <NavLink
                  to="/admin/users"
                  onClick={closeMenu}
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                >
                  👥 User Management
                </NavLink>
              )}

              <NavLink
                to="/profile"
                onClick={closeMenu}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                👤 Profile Settings
              </NavLink>

              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleLogout}
                style={{ marginTop: '0.5rem', width: '100%' }}
              >
                Logout
              </button>
            </>
          )}

          {!isAuthenticated && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
              <Link to="/login" onClick={closeMenu} className="btn btn-outline" style={{ width: '100%' }}>
                Login
              </Link>
              <Link to="/register" onClick={closeMenu} className="btn btn-primary" style={{ width: '100%' }}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        .nav-link {
          color: var(--text-muted);
          text-decoration: none;
          padding: 0.5rem 0.9rem;
          border-radius: var(--radius-sm);
          font-size: 0.92rem;
          font-weight: 600;
          transition: var(--transition);
        }
        .nav-link:hover {
  color: var(--primary);
  background: #eef2ff;
}
        
        .nav-link.active {
  color: var(--primary);
  background: #eef2ff;
  font-weight: 700;
}
        .mobile-nav-link {
          color: var(--text-main);
          text-decoration: none;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-sm);
          font-size: 0.95rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .mobile-nav-link.active {
          background: rgba(99, 102, 241, 0.15);
          color: var(--primary);
          font-weight: 700;
        }
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-user {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
