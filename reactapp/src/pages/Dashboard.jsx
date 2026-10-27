import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import sessionService from '../services/sessionService';
import boothService from '../services/boothService';
import registrationService from '../services/registrationService';
import networkingService from '../services/networkingService';
import userService from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Dashboard = () => {
  const { username, role } = useAuth();
  const [stats, setStats] = useState({
    eventsCount: 0,
    upcomingEventsCount: 0,
    sessionsCount: 0,
    boothsCount: 0,
    registrationsCount: 0,
    connectionsCount: 0,
    usersCount: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [role, username]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch common accessible data
      const [eventsRes, sessionsRes] = await Promise.allSettled([
        eventService.getAllEvents(),
        sessionService.getAllSessions(),
      ]);

      const events = eventsRes.status === 'fulfilled' ? eventsRes.value : [];
      const sessions = sessionsRes.status === 'fulfilled' ? sessionsRes.value : [];

      const now = new Date();
      const upcomingEv = events.filter((e) => e.dateTime && new Date(e.dateTime) >= now);

      let booths = [];
      let registrations = [];
      let connections = [];
      let users = [];

      // Fetch role-specific data
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        const [boothsRes, regsRes, usersRes] = await Promise.allSettled([
          boothService.getAllBooths(),
          registrationService.getAllRegistrations(),
          userService.getAllUsers(),
        ]);
        if (boothsRes.status === 'fulfilled') booths = boothsRes.value;
        if (regsRes.status === 'fulfilled') registrations = regsRes.value;
        if (usersRes.status === 'fulfilled') users = usersRes.value;
      } else if (role === 'ORGANIZER') {
        const [boothsRes, regsRes] = await Promise.allSettled([
          boothService.getAllBooths(),
          registrationService.getAllRegistrations(),
        ]);
        if (boothsRes.status === 'fulfilled') booths = boothsRes.value;
        if (regsRes.status === 'fulfilled') registrations = regsRes.value;
      } else if (role === 'ATTENDEE') {
        const [connsRes, regsRes] = await Promise.allSettled([
          networkingService.getMyConnections(),
          registrationService.getAllRegistrations(),
        ]);
        if (connsRes.status === 'fulfilled') connections = connsRes.value;
        if (regsRes.status === 'fulfilled') registrations = regsRes.value;
      } else if (role === 'SPONSOR') {
        const boothsRes = await boothService.getAllBooths().catch(() => []);
        booths = boothsRes;
      }

      setStats({
        eventsCount: events.length,
        upcomingEventsCount: upcomingEv.length,
        sessionsCount: sessions.length,
        boothsCount: booths.length,
        registrationsCount: registrations.length,
        connectionsCount: connections.length,
        usersCount: users.length,
      });

      setRecentEvents(events.slice(0, 4));
      setUpcomingSessions(sessions.slice(0, 4));
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      {/* Header Banner */}
      <div
        className="page-header"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.4rem' }}>👋</span>
            <h1 className="page-title" style={{ fontSize: '1.85rem' }}>
              {getGreeting()}, {username || 'Event Host'}!
            </h1>
          </div>
          <p className="page-subtitle">
            Welcome to your <strong>{role}</strong> management command center.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {(role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'ORGANIZER') && (
            <Link to="/events/new" className="btn btn-primary">
              ➕ Create Event
            </Link>
          )}
          <Link to="/events" className="btn btn-secondary">
            🎟️ Explore Events
          </Link>
         {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
            <Link to="/admin/users" className="btn btn-outline">
              👥 Manage Users
            </Link>
          )}
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchDashboardData} />

      {loading ? (
        <LoadingSpinner text="Aggregating platform metrics..." />
      ) : (
        <>
          {/* Key Metrics Stats Grid */}
          <div className="grid-stats">
            <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Total Events
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0.35rem 0' }}>
                {stats.eventsCount}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
                🚀 {stats.upcomingEventsCount} Upcoming
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Live & Scheduled Sessions
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0.35rem 0' }}>
                {stats.sessionsCount}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                🎙️ Keynotes, Panels & Workshops
              </div>
            </div>

            {(role === 'ADMIN' || role === 'ORGANIZER' || role === 'SPONSOR') && (
              <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Virtual Expo Booths
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0.35rem 0' }}>
                  {stats.boothsCount}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#f472b6' }}>
                  🏢 Sponsor Exhibitions
                </div>
              </div>
            )}

            {(role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'ORGANIZER') && (
              <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Total Registrations
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0.35rem 0' }}>
                  {stats.registrationsCount}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#34d399' }}>
                  🎫 Attendee Event Passes
                </div>
              </div>
            )}

            {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
              <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Platform Accounts
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0.35rem 0' }}>
                  {stats.usersCount}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                  👥 Registered Users
                </div>
              </div>
            )}

            {role === 'ATTENDEE' && (
              <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  My Connections
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '0.35rem 0' }}>
                  {stats.connectionsCount}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
                  🤝 Peer Networking
                </div>
              </div>
            )}
          </div>

          {/* Quick Sections: Recent Events & Upcoming Sessions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
            {/* Recent Events Card */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Active & Upcoming Events</h3>
                <Link to="/events" style={{ color: 'var(--primary)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>
                  View All →
                </Link>
              </div>

              {recentEvents.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No events hosted yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {recentEvents.map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>
                          <Link to={`/events/${ev.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {ev.title}
                          </Link>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          📅 {ev.dateTime ? new Date(ev.dateTime).toLocaleDateString() : 'TBA'}
                        </div>
                      </div>
                      <Link to={`/events/${ev.id}`} className="btn btn-sm btn-outline">
                        Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Sessions Card */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Featured Sessions</h3>
                <Link to="/sessions" style={{ color: 'var(--primary)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>
                  View All →
                </Link>
              </div>

              {upcomingSessions.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No sessions scheduled yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {upcomingSessions.map((sess) => (
                    <div
                      key={sess.id}
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>
                          {sess.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>
                          🏷️ {sess.sessionType || 'Session'} • {sess.eventTitle || 'General'}
                        </div>
                      </div>
                      <Link to="/sessions" className="btn btn-sm btn-outline">
                        Schedule
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
