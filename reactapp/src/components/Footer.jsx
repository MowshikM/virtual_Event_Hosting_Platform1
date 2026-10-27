import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      style={{
        background: 'rgba(7, 10, 18, 0.95)',
        borderTop: '1px solid var(--border)',
        padding: '3rem 1.5rem 2rem 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1380px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Col 1: Platform Overview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
              }}
            >
              ⚡
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              Virtual Event Hosting Platform
            </h4>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Enterprise-grade virtual & hybrid conference management system. Stream keynotes, manage expo booths, facilitate 1-on-1 networking, and analyze real-time attendee engagement.
          </p>
        </div>

        {/* Col 2: Navigation Links */}
        <div>
          <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Quick Links
          </h5>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
            <li>
              <Link to="/events" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                Browse Events
              </Link>
            </li>
            <li>
              <Link to="/sessions" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                Session Schedules
              </Link>
            </li>
            <li>
              <Link to="/booths" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                Virtual Expo Hall
              </Link>
            </li>
            <li>
              <Link to="/networking" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                Attendee Networking
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Role Portals */}
        <div>
          <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Platform Modules
          </h5>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
            <li>
              <span style={{ color: 'var(--text-dim)' }}>Live Q&A & Chat Moderation</span>
            </li>
            <li>
              <span style={{ color: 'var(--text-dim)' }}>Smart Attendance Tracking</span>
            </li>
            <li>
              <span style={{ color: 'var(--text-dim)' }}>Sponsor Lead Capture</span>
            </li>
            <li>
              <span style={{ color: 'var(--text-dim)' }}>Engagement Analytics</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div
        style={{
          maxWidth: '1380px',
          margin: '0 auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(148, 163, 184, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-dim)',
        }}
      >
        <div>
          © {new Date().getFullYear()} Virtual Event Hosting Platform. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Powered by Spring Boot & React</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
