import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import analyticsService from '../services/analyticsService';
import eventService from '../services/eventService';
import sessionService from '../services/sessionService';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import EmptyState from '../components/EmptyState';

const Analytics = () => {
  
  const { role, username } = useAuth();
  const canRecordAnalytics =
  role === 'ADMIN' ||
  role === 'SUPER_ADMIN' ||
  role === 'ORGANIZER';

  const [analytics, setAnalytics] = useState([]);
  const [events, setEvents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Manual Track Modal / Simulation
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackForm, setTrackForm] = useState({
    eventId: '',
    sessionId: '',
    userId: '1',
    engagementType: 'CHAT',
    engagementData: '{"device":"Web","quality":"1080p"}',
    durationSeconds: 120,
  });
  const [trackLoading, setTrackLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsData, eventsData, sessionsData] = await Promise.all([
        analyticsService.getAllAnalytics(),
        eventService.getAllEvents().catch(() => []),
        sessionService.getAllSessions().catch(() => []),
      ]);

      setAnalytics(analyticsData || []);
      setEvents(eventsData || []);
      setSessions(sessionsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load engagement analytics.');
    } finally {
      setLoading(false);
    }
  };

  // Metrics summary computations
 // Metrics summary computations
const metrics = useMemo(() => {
  const totalEvents = analytics.length;

  const totalDurationSecs = analytics.reduce(
    (acc, curr) => acc + (curr.durationSeconds || 0),
    0
  );

  const totalDurationHours = (totalDurationSecs / 3600).toFixed(1);

  const avgDurationMins =
    totalEvents > 0
      ? (totalDurationSecs / totalEvents / 60).toFixed(1)
      : '0.0';

  const uniqueUsers = new Set(
    analytics
      .filter((a) => a.userId)
      .map((a) => a.userId)
  ).size;

  const chats = analytics.filter(
    (a) => a.engagementType === 'CHAT'
  ).length;

  const questions = analytics.filter(
    (a) => a.engagementType === 'QUESTION'
  ).length;

  const boothVisits = analytics.filter(
    (a) => a.engagementType === 'BOOTH_VISIT'
  ).length;

  const boothLeads = analytics.filter(
    (a) => a.engagementType === 'BOOTH_LEAD'
  ).length;

  const typeMap = {};

  analytics.forEach((a) => {
    const type = a.engagementType || 'OTHER';
    typeMap[type] = (typeMap[type] || 0) + 1;
  });

  const maxTypeCount =
    Math.max(...Object.values(typeMap), 1);

  return {
    totalEvents,
    totalDurationHours,
    avgDurationMins,
    uniqueUsers,
    chats,
    questions,
    boothVisits,
    boothLeads,
    typeMap,
    maxTypeCount,
  };
}, [analytics]);

  const filteredAnalytics = useMemo(() => {
    return analytics.filter((a) => {
      const matchesSearch =
        searchKeyword === '' ||
        (a.engagementType && a.engagementType.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (a.engagementData && a.engagementData.toLowerCase().includes(searchKeyword.toLowerCase()));

      const matchesEvent =
        selectedEventId === 'ALL' || String(a.eventId) === String(selectedEventId);

      const matchesType =
        selectedType === 'ALL' || a.engagementType === selectedType;

      return matchesSearch && matchesEvent && matchesType;
    });
  }, [analytics, searchKeyword, selectedEventId, selectedType]);

  const paginatedAnalytics = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAnalytics.slice(start, start + pageSize);
  }, [filteredAnalytics, currentPage, pageSize]);

  const handleRecordAnalytics = async (e) => {
    e.preventDefault();
    setTrackLoading(true);
    setError('');
    try {
      const payload = {
        eventId: trackForm.eventId ? Number(trackForm.eventId) : null,
        sessionId: trackForm.sessionId ? Number(trackForm.sessionId) : null,
        userId: Number(trackForm.userId) || 1,
        engagementType: trackForm.engagementType,
        engagementData: trackForm.engagementData,
        durationSeconds: Number(trackForm.durationSeconds) || 60,
      };

      const recorded = await analyticsService.recordAnalytics(payload);
      setAnalytics((prev) => [recorded, ...prev]);
      setSuccess('Engagement metric logged successfully!');
      setTrackModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to record analytics entry.');
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Engagement & Telemetry</h1>
          <p className="page-subtitle">
            Real-time analytics on attendee participation, session watch durations, and expo interactions.
          </p>
        </div>

        {canRecordAnalytics && (
  <button
    type="button"
    className="btn btn-primary"
    onClick={() => {
      setTrackForm({
        eventId: events.length > 0 ? String(events[0].id) : '',
        sessionId: sessions.length > 0 ? String(sessions[0].id) : '',
        userId: '1',
        engagementType: 'CHAT',
        engagementData: '{"device":"Web","quality":"1080p"}',
        durationSeconds: 180,
      });
      setTrackModalOpen(true);
    }}
  >
    📈 Record Engagement Point
  </button>
)}
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} onRetry={fetchData} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <LoadingSpinner text="Crunching engagement statistics..." />
      ) : (
        <>
          {/* Analytics Summary Cards */}
<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  }}
>
  {/* Total Engagement */}
  <div
    className="glass-card"
    style={{
      padding: '1.35rem',
      borderLeft: '4px solid var(--primary)',
    }}
  >
    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
      ⚡
    </div>

    <div
      style={{
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        fontWeight: 700,
      }}
    >
      TOTAL ENGAGEMENT
    </div>

    <div
      style={{
        fontSize: '2rem',
        fontWeight: 800,
        color: '#ffffff',
        marginTop: '0.25rem',
      }}
    >
      {metrics.totalEvents}
    </div>

    <div
      style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginTop: '0.25rem',
      }}
    >
      All tracked activities
    </div>
  </div>

  {/* Unique Users */}
  <div
    className="glass-card"
    style={{
      padding: '1.35rem',
      borderLeft: '4px solid var(--secondary)',
    }}
  >
    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
      👥
    </div>

    <div
      style={{
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        fontWeight: 700,
      }}
    >
      UNIQUE USERS
    </div>

    <div
      style={{
        fontSize: '2rem',
        fontWeight: 800,
        color: '#ffffff',
        marginTop: '0.25rem',
      }}
    >
      {metrics.uniqueUsers}
    </div>

    <div
      style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginTop: '0.25rem',
      }}
    >
      Active participants
    </div>
  </div>

  {/* Chats */}
  <div
    className="glass-card"
    style={{
      padding: '1.35rem',
      borderLeft: '4px solid #f472b6',
    }}
  >
    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
      💬
    </div>

    <div
      style={{
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        fontWeight: 700,
      }}
    >
      LIVE CHATS
    </div>

    <div
      style={{
        fontSize: '2rem',
        fontWeight: 800,
        color: '#ffffff',
        marginTop: '0.25rem',
      }}
    >
      {metrics.chats}
    </div>

    <div
      style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginTop: '0.25rem',
      }}
    >
      Audience conversations
    </div>
  </div>

  {/* Questions */}
  <div
    className="glass-card"
    style={{
      padding: '1.35rem',
      borderLeft: '4px solid #fbbf24',
    }}
  >
    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
      ❓
    </div>

    <div
      style={{
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        fontWeight: 700,
      }}
    >
      QUESTIONS
    </div>

    <div
      style={{
        fontSize: '2rem',
        fontWeight: 800,
        color: '#ffffff',
        marginTop: '0.25rem',
      }}
    >
      {metrics.questions}
    </div>

    <div
      style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginTop: '0.25rem',
      }}
    >
      Speaker interactions
    </div>
  </div>

  {/* Booth Visits */}
  <div
    className="glass-card"
    style={{
      padding: '1.35rem',
      borderLeft: '4px solid #60a5fa',
    }}
  >
    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
      🏢
    </div>

    <div
      style={{
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        fontWeight: 700,
      }}
    >
      BOOTH VISITS
    </div>

    <div
      style={{
        fontSize: '2rem',
        fontWeight: 800,
        color: '#ffffff',
        marginTop: '0.25rem',
      }}
    >
      {metrics.boothVisits}
    </div>

    <div
      style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginTop: '0.25rem',
      }}
    >
      Sponsor booth visits
    </div>
  </div>

  {/* Leads */}
  <div
    className="glass-card"
    style={{
      padding: '1.35rem',
      borderLeft: '4px solid #34d399',
    }}
  >
    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
      🎯
    </div>

    <div
      style={{
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        fontWeight: 700,
      }}
    >
      LEADS GENERATED
    </div>

    <div
      style={{
        fontSize: '2rem',
        fontWeight: 800,
        color: '#ffffff',
        marginTop: '0.25rem',
      }}
    >
      {metrics.boothLeads}
    </div>

    <div
      style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginTop: '0.25rem',
      }}
    >
      Sponsor leads
    </div>
  </div>
</div>

          {/* Engagement Overview */}
<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.6fr)',
    gap: '1.25rem',
    marginBottom: '2rem',
  }}
>
  {/* Engagement Breakdown */}
  <div
    className="glass-card"
    style={{
      padding: '1.5rem',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
      }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            fontSize: '1.05rem',
            fontWeight: 800,
            color: '#ffffff',
          }}
        >
          Engagement Breakdown
        </h3>

        <p
          style={{
            margin: '0.25rem 0 0',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          Activity generated by attendees
        </p>
      </div>

      <span
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        {metrics.totalEvents} total
      </span>
    </div>

    {Object.keys(metrics.typeMap).length === 0 ? (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
      >
        No engagement data available.
      </div>
    ) : (
      Object.entries(metrics.typeMap).map(([type, count]) => {
        const percentage =
          (count / metrics.maxTypeCount) * 100;

        return (
          <div
            key={type}
            style={{
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.4rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {type}
              </span>

              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                {count}
              </span>
            </div>

            <div
              style={{
                height: '9px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${percentage}%`,
                  height: '100%',
                  borderRadius: '999px',
                  background:
                    'linear-gradient(90deg, var(--primary), var(--secondary))',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        );
      })
    )}
  </div>

  {/* Engagement Highlights */}
  <div
    className="glass-card"
    style={{
      padding: '1.5rem',
    }}
  >
    <h3
      style={{
        margin: 0,
        fontSize: '1.05rem',
        fontWeight: 800,
        color: '#ffffff',
      }}
    >
      Engagement Highlights
    </h3>

    <p
      style={{
        margin: '0.25rem 0 1.25rem',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
      }}
    >
      Quick overview of attendee activity
    </p>

    <div
      style={{
        display: 'grid',
        gap: '0.8rem',
      }}
    >
      <div
        style={{
          padding: '0.9rem',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.04)',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          Most common activity
        </div>

        <div
          style={{
            marginTop: '0.25rem',
            fontSize: '1rem',
            fontWeight: 800,
            color: '#ffffff',
          }}
        >
          {Object.entries(metrics.typeMap).length > 0
            ? Object.entries(metrics.typeMap).sort(
                (a, b) => b[1] - a[1]
              )[0][0]
            : '—'}
        </div>
      </div>

      <div
        style={{
          padding: '0.9rem',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.04)',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          Booth conversion
        </div>

        <div
          style={{
            marginTop: '0.25rem',
            fontSize: '1rem',
            fontWeight: 800,
            color: '#34d399',
          }}
        >
          {metrics.boothVisits > 0
            ? `${(
                (metrics.boothLeads / metrics.boothVisits) *
                100
              ).toFixed(0)}%`
            : '0%'}
        </div>
      </div>

      <div
        style={{
          padding: '0.9rem',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.04)',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          Average engagement
        </div>

        <div
          style={{
            marginTop: '0.25rem',
            fontSize: '1rem',
            fontWeight: 800,
            color: '#ffffff',
          }}
        >
          {metrics.avgDurationMins} mins
        </div>
      </div>
    </div>
  </div>
</div>
          {/* Control Bar */}
          <div className="control-bar">
            <SearchBar
              value={searchKeyword}
              onChange={(val) => {
                setSearchKeyword(val);
                setCurrentPage(1);
              }}
              onClear={() => setSearchKeyword('')}
              placeholder="Search by engagement type or telemetry metadata..."
              style={{ maxWidth: '380px' }}
            />

            <div className="filters-group">
              {events.length > 0 && (
                <select
                  className="form-select"
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ width: 'auto', minWidth: '160px' }}
                  aria-label="Filter analytics by event"
                >
                  <option value="ALL">All Events</option>
                  {events.map((ev) => (
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
                style={{ width: 'auto', minWidth: '150px' }}
                aria-label="Filter analytics by type"
              >
                <option value="ALL">All Action Types</option>
                <option value="BOOTH_VISIT">Booth Visit</option>
<option value="BOOTH_LEAD">Booth Lead</option>
<option value="CHAT">Chat</option>
<option value="QUESTION">Question</option>
              </select>
            </div>
          </div>

          {/* Analytics Table */}
          {paginatedAnalytics.length === 0 ? (
            <EmptyState
              icon="📈"
              title="No analytics records found"
              description="No engagement telemetry points match your search criteria."
            />
          ) : (
            <>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Log ID</th>
                      <th>Action Type</th>
                      <th>Event ID</th>
                      <th>Session ID</th>
                      <th>Booth ID</th>
                      <th>User ID</th>
                      <th>Duration</th>
                      <th>Timestamp</th>
                      <th>Metadata Payload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAnalytics.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            #{item.id}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>
                            {item.engagementType}
                          </span>
                        </td>
                        <td>{item.eventId ? `#${item.eventId}` : '—'}</td>
                        <td>{item.sessionId ? `#${item.sessionId}` : '—'}</td>
                        <td>{item.boothId ? `#${item.boothId}` : '—'}</td>
                        <td>{item.userId ? `User #${item.userId}` : '—'}</td>
                        <td>
                          {item.durationSeconds ? `${item.durationSeconds}s` : '0s'}
                        </td>
                        <td>
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}
                        </td>
                        <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          {item.engagementData || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalItems={filteredAnalytics.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                itemLabel="logs"
              />
            </>
          )}
        </>
      )}

      {/* Record Analytics Modal */}
      {trackModalOpen && (
        <div className="modal-overlay" onClick={() => setTrackModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem', color: '#ffffff' }}>
              Log Engagement Telemetry Point
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Simulate or manually register attendee session views or booth visits.
            </p>

            <form onSubmit={handleRecordAnalytics}>
              <div className="form-group">
                <label className="form-label">Engagement Type</label>
                <select
                  className="form-select"
                  value={trackForm.engagementType}
                  onChange={(e) => setTrackForm({ ...trackForm, engagementType: e.target.value })}
                >
                  <option value="BOOTH_VISIT">BOOTH_VISIT (Exploring expo booth)</option>
<option value="BOOTH_LEAD">BOOTH_LEAD (Dropped lead)</option>
<option value="CHAT">CHAT (Live discussion)</option>
<option value="QUESTION">QUESTION (Speaker question)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Event</label>
                  <select
                    className="form-select"
                    value={trackForm.eventId}
                    onChange={(e) => setTrackForm({ ...trackForm, eventId: e.target.value })}
                  >
                    <option value="">None / Global</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Session</label>
                  <select
                    className="form-select"
                    value={trackForm.sessionId}
                    onChange={(e) => setTrackForm({ ...trackForm, sessionId: e.target.value })}
                  >
                    <option value="">None / General</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Duration (Seconds)</label>
                <input
                  type="number"
                  className="form-input"
                  value={trackForm.durationSeconds}
                  onChange={(e) => setTrackForm({ ...trackForm, durationSeconds: e.target.value })}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payload Data (JSON format)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={trackForm.engagementData}
                  onChange={(e) => setTrackForm({ ...trackForm, engagementData: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setTrackModalOpen(false)}
                  disabled={trackLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={trackLoading}>
                  {trackLoading ? 'Logging...' : 'Log Metric'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
