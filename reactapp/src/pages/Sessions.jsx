import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import sessionService from '../services/sessionService';
import eventService from '../services/eventService';
import interactionService from '../services/interactionService';
import attendanceService from '../services/attendanceService';
import registrationService from '../services/registrationService';
import SessionCard from '../components/SessionCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';

const Sessions = () => {
  const { isAuthenticated, role, username, userId, updateUserId } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Search
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Create / Edit Session Modal State
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionFormData, setSessionFormData] = useState({
    eventId: '',
    title: '',
    description: '',
    sessionType: 'KEYNOTE',
    startTime: '',
    endTime: '',
    speakerIds: '',
    streamingConfig: '',
    isRecorded: false,
    recordingUrl: '',
    status: 'SCHEDULED',
  });
  const [modalLoading, setModalLoading] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Live Chat & Q&A Modal State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [activeChatSession, setActiveChatSession] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [interactionType, setInteractionType] = useState('CHAT'); // 'CHAT' | 'QUESTION'
  const [chatLoading, setChatLoading] = useState(false);

  // Attendance state tracking
  const [attendedSessionIds, setAttendedSessionIds] = useState(new Set());
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [attendanceLoadingId, setAttendanceLoadingId] = useState(null);
const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
const [selectedAttendanceSession, setSelectedAttendanceSession] = useState(null);
const [attendanceRecords, setAttendanceRecords] = useState([]);
const [attendanceListLoading, setAttendanceListLoading] = useState(false);
const [attendanceEditModalOpen, setAttendanceEditModalOpen] = useState(false);
const [editingAttendance, setEditingAttendance] = useState(null);
const [attendanceEditForm, setAttendanceEditForm] = useState({
  joinTime: '',
  leaveTime: '',
  durationMinutes: '',
  engagementScore: '',
  interactionsCount: '',
  deviceType: '',
});
const [attendanceEditLoading, setAttendanceEditLoading] = useState(false);
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
  const loadRegisteredEvents = async () => {
    if (!isAuthenticated || role !== 'ATTENDEE' || !userId) {
      setRegisteredEventIds(new Set());
      return;
    }

    try {
      const registrations =
        await registrationService.getRegistrationsByAttendee(userId);

      const eventIds = new Set(
        (registrations || []).map((registration) =>
          String(registration.eventId)
        )
      );

      setRegisteredEventIds(eventIds);
    } catch (err) {
      setRegisteredEventIds(new Set());
      console.error('Failed to load registered events:', err);
    }
  };

  loadRegisteredEvents();
}, [isAuthenticated, role, userId]);
useEffect(() => {
  const loadAttendedSessions = async () => {
    if (!isAuthenticated || role !== 'ATTENDEE' || !userId) {
      setAttendedSessionIds(new Set());
      return;
    }

    try {
      const attendanceRecords =
        await attendanceService.getAttendanceByAttendee(userId);

      const sessionIds = new Set(
        (attendanceRecords || []).map((attendance) =>
          String(attendance.sessionId)
        )
      );

      setAttendedSessionIds(sessionIds);
    } catch (err) {
      setAttendedSessionIds(new Set());
      console.error('Failed to load attendance records:', err);
    }
  };

  loadAttendedSessions();
}, [isAuthenticated, role, userId]);
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sessionsData, eventsData] = await Promise.all([
        sessionService.getAllSessions(),
        eventService.getAllEvents().catch(() => []),
      ]);
      setSessions(sessionsData || []);
      setEvents(eventsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesSearch =
        searchKeyword === '' ||
        (s.title && s.title.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (s.description && s.description.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (s.speakerIds && s.speakerIds.toLowerCase().includes(searchKeyword.toLowerCase()));

      const matchesEvent =
        selectedEventId === 'ALL' || String(s.eventId) === String(selectedEventId);

      const matchesType =
        selectedType === 'ALL' || (s.sessionType && s.sessionType.toUpperCase() === selectedType);

      return matchesSearch && matchesEvent && matchesType;
    });
  }, [sessions, searchKeyword, selectedEventId, selectedType]);

  // Pagination
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSessions.slice(start, start + pageSize);
  }, [filteredSessions, currentPage, pageSize]);

  // Session Form Open Handlers
  const handleOpenCreate = () => {
    setEditingSession(null);
    setSessionFormData({
eventId:
  role === 'ORGANIZER'
    ? (events.find((ev) => String(ev.organizerId) === String(userId))?.id?.toString() || '')
    : (events.length > 0 ? String(events[0].id) : ''),      title: '',
      description: '',
      sessionType: 'KEYNOTE',
      startTime: '',
      endTime: '',
      speakerIds: '',
      streamingConfig: '',
      isRecorded: false,
      recordingUrl: '',
      status: 'SCHEDULED',
    });
    setSessionModalOpen(true);
  };

  const handleOpenEdit = (session) => {
    setEditingSession(session);
    setSessionFormData({
      eventId: session.eventId ? String(session.eventId) : '',
      title: session.title || '',
      description: session.description || '',
      sessionType: session.sessionType || 'KEYNOTE',
      startTime: session.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : '',
      endTime: session.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : '',
      speakerIds: session.speakerIds || '',
      streamingConfig: session.streamingConfig || '',
      isRecorded: !!session.isRecorded,
      recordingUrl: session.recordingUrl || '',
      status: session.status || 'SCHEDULED',
    });
    setSessionModalOpen(true);
  };

 const handleSaveSession = async (e) => {
  e.preventDefault();

  if (!sessionFormData.streamingConfig.trim()) {
    setError('Streaming URL / Stage Link is required.');
    return;
  }

  try {
    const url = new URL(sessionFormData.streamingConfig.trim());

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      setError('Please enter a valid streaming URL.');
      return;
    }
  } catch {
    setError('Please enter a valid streaming URL.');
    return;
  }

  setModalLoading(true);
    setError('');
    try {
      const payload = {
        eventId: Number(sessionFormData.eventId),
        title: sessionFormData.title.trim(),
        description: sessionFormData.description.trim(),
        sessionType: sessionFormData.sessionType,
        startTime: sessionFormData.startTime,
        endTime: sessionFormData.endTime,
        speakerIds: sessionFormData.speakerIds.trim(),
        streamingConfig: sessionFormData.streamingConfig.trim(),
        isRecorded: sessionFormData.isRecorded,
        recordingUrl: sessionFormData.recordingUrl.trim(),
        status: sessionFormData.status,
      };

      if (editingSession) {
        const updated = await sessionService.updateSession(editingSession.id, payload);
        setSessions((prev) => prev.map((s) => (s.id === editingSession.id ? updated : s)));
        setSuccess('Session updated successfully.');
      } else {
        const created = await sessionService.createSession(payload);
        setSessions((prev) => [created, ...prev]);
        setSuccess('Session scheduled successfully.');
      }

      setSessionModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to save session.');
    } finally {
      setModalLoading(false);
    }
  };

  // Delete Handler
  const handleOpenDelete = (session) => {
    setSessionToDelete(session);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    setDeleteLoading(true);
    try {
      await sessionService.deleteSession(sessionToDelete.id);
      setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id));
      setSuccess('Session deleted successfully.');
      setDeleteModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete session.');
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleJoinStream = async (session) => {
  if (!isAuthenticated) {
    setError(
      'Please log in and register for the event before joining the stream.'
    );
    return;
  }

  try {
    setError('');

    const streamUrl = await sessionService.joinStream(session.id);

    if (streamUrl) {
      window.open(streamUrl, '_blank', 'noopener,noreferrer');
    }
  } catch (err) {
    setError(
      err.response?.data?.message ||
      err.message ||
      'You are not authorized to join this stream.'
    );
  }
};

  // Live Chat & Q&A Handlers
  const handleOpenChat = async (session) => {
    setActiveChatSession(session);
    setChatModalOpen(true);
    setChatLoading(true);
    try {
      const data = await interactionService.getInteractionsBySession(session.id);
      setInteractions(data || []);
    } catch (err) {
      console.error('Error fetching chat:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatSession) return;

    try {
      const payload = {
        sessionId: activeChatSession.id,
        interactionType: interactionType,
        content: chatInput.trim(),
        metadata: JSON.stringify({ role, author: username }),
      };

      const newInteraction = await interactionService.createInteraction(payload);
      if (newInteraction && newInteraction.userId && updateUserId) {
        updateUserId(newInteraction.userId);
      }
      setInteractions((prev) => [...prev, newInteraction]);
      setChatInput('');
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    }
  };

  const handleModerateInteraction = async (interactionId, approved) => {
    try {
      const updated = await interactionService.moderateInteraction(interactionId, approved);
      setInteractions((prev) =>
        prev.map((item) => (item.id === interactionId ? updated : item))
      );
    } catch (err) {
      setError(err.message || 'Moderation action failed.');
    }
  };
  const handleDeleteInteraction = async (interactionId) => {
  if (!window.confirm('Are you sure you want to delete this interaction?')) {
    return;
  }

  try {
    await interactionService.deleteInteraction(interactionId);

    setInteractions((prev) =>
      prev.filter((item) => item.id !== interactionId)
    );

    setSuccess('Interaction deleted successfully.');
  } catch (err) {
    setError(err.message || 'Failed to delete interaction.');
  }
};

  // Mark Attendance Handler
  const handleMarkAttendance = async (session) => {
    setAttendanceLoadingId(session.id);
    try {
     const now = new Date().toISOString();

await attendanceService.recordAttendance({
  sessionId: session.id,
        joinTime: now,
        leaveTime: null,
        durationMinutes: 45,
        engagementScore: 100.0,
        interactionsCount: 1,
        deviceType: 'Web Desktop',
      });
setAttendedSessionIds((prev) => new Set(prev).add(String(session.id)));      setSuccess(`Attendance recorded for "${session.title}"!`);
    } catch (err) {
      setError(err.message || 'Could not record attendance.');
    } finally {
      setAttendanceLoadingId(null);
    }
  };
  const handleViewAttendance = async (session) => {
  setSelectedAttendanceSession(session);
  setAttendanceModalOpen(true);
  setAttendanceListLoading(true);
  setError('');

  try {
    const data = await attendanceService.getAttendanceBySession(session.id);
    setAttendanceRecords(data || []);
  } catch (err) {
    setError(err.message || 'Failed to load attendance.');
  } finally {
    setAttendanceListLoading(false);
  }
};
const handleEditAttendance = (attendance) => {
  setEditingAttendance(attendance);
  setAttendanceEditForm({
    joinTime: attendance.joinTime
      ? new Date(attendance.joinTime).toISOString().slice(0, 16)
      : '',
    leaveTime: attendance.leaveTime
      ? new Date(attendance.leaveTime).toISOString().slice(0, 16)
      : '',
    durationMinutes: attendance.durationMinutes ?? '',
    engagementScore: attendance.engagementScore ?? '',
    interactionsCount: attendance.interactionsCount ?? '',
    deviceType: attendance.deviceType || '',
  });
  setAttendanceEditModalOpen(true);
};
const handleSaveAttendanceEdit = async (e) => {
  e.preventDefault();

  if (!editingAttendance) return;

  setAttendanceEditLoading(true);
  setError('');

  try {
    const updated = await attendanceService.updateAttendance(
      editingAttendance.id,
      {
        sessionId: editingAttendance.sessionId,
        attendeeId: editingAttendance.attendeeId,
        joinTime: attendanceEditForm.joinTime || null,
        leaveTime: attendanceEditForm.leaveTime || null,
        durationMinutes:
          attendanceEditForm.durationMinutes === ''
            ? null
            : Number(attendanceEditForm.durationMinutes),
        engagementScore:
          attendanceEditForm.engagementScore === ''
            ? null
            : Number(attendanceEditForm.engagementScore),
        interactionsCount:
          attendanceEditForm.interactionsCount === ''
            ? null
            : Number(attendanceEditForm.interactionsCount),
        deviceType: attendanceEditForm.deviceType,
      }
    );

    setAttendanceRecords((prev) =>
      prev.map((item) =>
        item.id === editingAttendance.id ? updated : item
      )
    );

    setAttendanceEditModalOpen(false);
    setEditingAttendance(null);
    setSuccess('Attendance updated successfully.');
  } catch (err) {
    setError(err.message || 'Failed to update attendance.');
  } finally {
    setAttendanceEditLoading(false);
  }
};

const handleDeleteAttendance = async (attendance) => {
  if (!window.confirm(
    `Are you sure you want to delete attendance for ${attendance.attendeeName}?`
  )) {
    return;
  }

  try {
    await attendanceService.deleteAttendance(attendance.id);

    setAttendanceRecords((prev) =>
      prev.filter((item) => item.id !== attendance.id)
    );

    setSuccess('Attendance deleted successfully.');
  } catch (err) {
    setError(err.message || 'Failed to delete attendance.');
  }
};

  const canManage =
  isAuthenticated &&
  (
    role === 'ADMIN' ||
    role === 'SUPER_ADMIN' ||
    role === 'ORGANIZER'
  );

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Session Schedule & Keynotes</h1>
          <p className="page-subtitle">
            Explore live streams, technical workshops, panel discussions, and interact with speakers.
          </p>
        </div>

        {canManage && (
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            ➕ Schedule New Session
          </button>
        )}
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} onRetry={fetchData} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />

      {/* Filter Bar */}
      <div className="control-bar">
        <SearchBar
          value={searchKeyword}
          onChange={(val) => {
            setSearchKeyword(val);
            setCurrentPage(1);
          }}
          onClear={() => setSearchKeyword('')}
          placeholder="Search sessions by title, speaker or topic..."
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
              aria-label="Filter sessions by event"
            >
              <option value="ALL">All Events</option>
              {events.map((ev) => (
  <option key={ev.id} value={ev.id}>
    {ev.title}
  </option>
))}    </select>
          )}

          <select
            className="form-select"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 'auto', minWidth: '140px' }}
            aria-label="Filter sessions by type"
          >
            <option value="ALL">All Formats</option>
            <option value="KEYNOTE">Keynote</option>
            <option value="WORKSHOP">Workshop</option>
            <option value="PANEL">Panel Discussion</option>
            <option value="BREAKOUT">Breakout Session</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching session schedules..." />
      ) : paginatedSessions.length === 0 ? (
        <EmptyState
          icon="🎙️"
          title="No sessions found"
          description="No sessions match your search or filter criteria."
          actionText={canManage ? 'Schedule a Session' : undefined}
          onAction={canManage ? handleOpenCreate : undefined}
        />
      ) : (
        <>
          <div className="grid-cards">
            {paginatedSessions.map((sess) => {
  const sessionEvent = events.find(
    (ev) => String(ev.id) === String(sess.eventId)
  );
  

  const canManageThisSession =
    isAuthenticated &&
    (
      role === 'ADMIN' ||
      role === 'SUPER_ADMIN' ||
      (
        role === 'ORGANIZER' &&
        sessionEvent &&
        String(sessionEvent.organizerId) === String(userId)
      )
    );
    const canMarkAttendanceThisSession =
  isAuthenticated &&
  role === 'ATTENDEE' &&
  registeredEventIds.has(String(sess.eventId));
  const canViewAttendanceThisSession =
  isAuthenticated &&
  (
    role === 'ADMIN' ||
    role === 'SUPER_ADMIN' ||
    (
      role === 'ORGANIZER' &&
      sessionEvent &&
      String(sessionEvent.organizerId) === String(userId)
    ) ||
    (
      role === 'ATTENDEE' &&
      registeredEventIds.has(String(sess.eventId))
    )
  );


  return (
    <SessionCard
  key={sess.id}
  session={sess}
  onOpenChat={handleOpenChat}
 onMarkAttendance={
  canMarkAttendanceThisSession ? handleMarkAttendance : undefined
}
onViewAttendance={
  canViewAttendanceThisSession ? handleViewAttendance : undefined
}  onEdit={handleOpenEdit}
  onDelete={handleOpenDelete}
  onJoinLive={handleJoinStream}
  canManageSession={canManageThisSession}
isAttendanceMarked={attendedSessionIds.has(String(sess.id))}  isAttendanceLoading={attendanceLoadingId === sess.id}
/>
  );
})}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredSessions.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            itemLabel="sessions"
          />
        </>
      )}

      {/* Create / Edit Session Modal */}
      {sessionModalOpen && (
        <div className="modal-overlay" onClick={() => setSessionModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem', color: '#ffffff' }}>
              {editingSession ? 'Edit Session' : 'Schedule New Session'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Configure session timetable, speakers, and streaming details.
            </p>

            <form onSubmit={handleSaveSession}>
              <div className="form-group">
                <label className="form-label">Parent Event <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={sessionFormData.eventId}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, eventId: e.target.value })}
                  required
                >
                  <option value="">Select an Event</option>
                  {events
  .filter(
    (ev) =>
      role === 'ADMIN' ||
      role === 'SUPER_ADMIN' ||
      String(ev.organizerId) === String(userId)
  )
  .map((ev) => (
    <option key={ev.id} value={ev.id}>
      {ev.title}
    </option>
  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Session Title <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={sessionFormData.title}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, title: e.target.value })}
                  placeholder="e.g. Next-Gen Cloud Architecture"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Session Type</label>
                  <select
                    className="form-select"
                    value={sessionFormData.sessionType}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, sessionType: e.target.value })}
                  >
                    <option value="KEYNOTE">Keynote</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="PANEL">Panel</option>
                    <option value="BREAKOUT">Breakout</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={sessionFormData.status}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, status: e.target.value })}
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="LIVE">Live</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Time <span className="required">*</span></label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={sessionFormData.startTime}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time <span className="required">*</span></label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={sessionFormData.endTime}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Featured Speakers</label>
                <input
                  type="text"
                  className="form-input"
                  value={sessionFormData.speakerIds}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, speakerIds: e.target.value })}
                  placeholder="e.g. Dr. Jane Doe (Tech Lead), Alan Turing (Special Guest)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
  Streaming URL / Stage Link <span className="required">*</span>
</label>
                <input
                  type="url"
                  className="form-input"
                  value={sessionFormData.streamingConfig}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, streamingConfig: e.target.value })}
                  placeholder="https://live.stream.io/stage/1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={sessionFormData.description}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, description: e.target.value })}
                  placeholder="Brief synopsis of topics covered..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSessionModalOpen(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Chat & Q&A Modal */}
      {chatModalOpen && activeChatSession && (
        <div className="modal-overlay" onClick={() => setChatModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', height: '80vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  💬 {activeChatSession.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>
                  Live Session Interaction & Q&A
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Chat List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {chatLoading ? (
                <LoadingSpinner text="Loading conversation..." />
              ) : interactions.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', margin: 'auto' }}>
                  No messages yet. Be the first to ask a question!
                </div>
              ) : (
                interactions.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      background: msg.interactionType === 'QUESTION' ? 'rgba(236, 72, 153, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                      border: msg.interactionType === 'QUESTION' ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ffffff' }}>
                          {msg.username || 'Attendee'}
                        </span>
                        {msg.interactionType === 'QUESTION' && (
                          <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
                            ❓ Question
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                      {msg.content}
                    </p>

                    {/* Moderation Controls for Organizer/Admin */}
                    {/* Moderation / Delete Controls */}
{canManage && (
  <div
    style={{
      marginTop: '0.5rem',
      display: 'flex',
      gap: '0.4rem',
      justifyContent: 'flex-end'
    }}
  >
    <button
      type="button"
      className="btn btn-sm btn-outline"
      onClick={() =>
        handleModerateInteraction(msg.id, !msg.isApproved)
      }
      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
    >
      {msg.isApproved ? 'Mark Inappropriate' : 'Approve'}
    </button>

    {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
      <button
        type="button"
        className="btn btn-sm btn-danger"
        onClick={() => handleDeleteInteraction(msg.id)}
        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
      >
        🗑️ Delete
      </button>
    )}
  </div>
)}
                  </div>
                ))
              )}
            </div>

            {/* Chat Input Form */}
            {isAuthenticated ? (
              <form onSubmit={handleSendChat} style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${interactionType === 'CHAT' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setInteractionType('CHAT')}
                  >
                    💬 Message
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${interactionType === 'QUESTION' ? 'btn-accent' : 'btn-outline'}`}
                    onClick={() => setInteractionType('QUESTION')}
                  >
                    ❓ Ask Question
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={interactionType === 'QUESTION' ? 'Type your question for speakers...' : 'Send a chat message...'}
                  />
                  <button type="submit" className="btn btn-primary">
                    Send
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                Please log in to participate in the live session chat.
              </div>
            )}
          </div>
        </div>
      )}
      {/* Session Attendance Modal */}
{attendanceModalOpen && selectedAttendanceSession && (
  <div
    className="modal-overlay"
    onClick={() => setAttendanceModalOpen(false)}
  >
    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()}
      style={{ maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              color: '#ffffff',
            }}
          >
            👥 Session Attendance
          </h3>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              marginTop: '0.25rem',
            }}
          >
            {selectedAttendanceSession.title}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAttendanceModalOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            fontSize: '1.2rem',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      {/* Attendance Content */}
      {attendanceListLoading ? (
        <LoadingSpinner text="Loading attendance..." />
      ) : attendanceRecords.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'var(--text-dim)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            👥
          </div>

          <p>No attendance records found for this session.</p>
        </div>
      ) : (
        <>
          <div
            style={{
              marginBottom: '1rem',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            Total Attendees:{' '}
            <strong style={{ color: '#ffffff' }}>
              {attendanceRecords.length}
            </strong>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {attendanceRecords.map((attendance) => (
              <div
                key={attendance.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                {/* Attendee Name */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  <strong
                    style={{
                      color: '#ffffff',
                      fontSize: '1rem',
                    }}
                  >
                    👤 {attendance.attendeeName || 'Unknown Attendee'}
                  </strong>

                  <span
                    className="badge badge-success"
                    style={{ fontSize: '0.7rem' }}
                  >
                    Attended
                  </span>
                </div>

                {/* Attendance Details */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '0.75rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div>
                    <strong>Join Time</strong>
                    <br />
                    {attendance.joinTime
                      ? new Date(attendance.joinTime).toLocaleString()
                      : 'N/A'}
                  </div>

                  <div>
                    <strong>Leave Time</strong>
                    <br />
                    {attendance.leaveTime
                      ? new Date(attendance.leaveTime).toLocaleString()
                      : 'Still attending'}
                  </div>

                  <div>
                    <strong>Duration</strong>
                    <br />
                    {attendance.durationMinutes ?? 0} minutes
                  </div>

                  <div>
                    <strong>Engagement</strong>
                    <br />
                    {attendance.engagementScore ?? 0}
                  </div>

                  <div>
                    <strong>Interactions</strong>
                    <br />
                    {attendance.interactionsCount ?? 0}
                  </div>

                  <div>
                    <strong>Device</strong>
                    <br />
                    {attendance.deviceType || 'N/A'}
                    </div>
</div>
                                  {(
                  role === 'ADMIN' ||
                  role === 'SUPER_ADMIN' ||
                  role === 'ORGANIZER'
                ) && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditAttendance(attendance)}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteAttendance(attendance)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
                  </div>
               
            ))}
          </div>
        </>
      )}

      {/* Close */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '1.5rem',
        }}
      >
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setAttendanceModalOpen(false)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
{/* Edit Attendance Modal */}
{attendanceEditModalOpen && editingAttendance && (
  <div
    className="modal-overlay"
    onClick={() => setAttendanceEditModalOpen(false)}
  >
    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()}
      style={{ maxWidth: '600px' }}
    >
      <h3
        style={{
          fontSize: '1.4rem',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '0.35rem',
        }}
      >
        ✏️ Edit Attendance
      </h3>

      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.88rem',
          marginBottom: '1.5rem',
        }}
      >
        {editingAttendance.attendeeName}
      </p>

      <form onSubmit={handleSaveAttendanceEdit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
          }}
        >
          <div className="form-group">
            <label className="form-label">Join Time</label>
            <input
              type="datetime-local"
              className="form-input"
              value={attendanceEditForm.joinTime}
              onChange={(e) =>
                setAttendanceEditForm({
                  ...attendanceEditForm,
                  joinTime: e.target.value,
                })
              }
              disabled={attendanceEditLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Leave Time</label>
            <input
              type="datetime-local"
              className="form-input"
              value={attendanceEditForm.leaveTime}
              onChange={(e) =>
                setAttendanceEditForm({
                  ...attendanceEditForm,
                  leaveTime: e.target.value,
                })
              }
              disabled={attendanceEditLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Duration (minutes)</label>
            <input
              type="number"
              min="0"
              className="form-input"
              value={attendanceEditForm.durationMinutes}
              onChange={(e) =>
                setAttendanceEditForm({
                  ...attendanceEditForm,
                  durationMinutes: e.target.value,
                })
              }
              disabled={attendanceEditLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Engagement Score</label>
            <input
              type="number"
              min="0"
              step="0.1"
              className="form-input"
              value={attendanceEditForm.engagementScore}
              onChange={(e) =>
                setAttendanceEditForm({
                  ...attendanceEditForm,
                  engagementScore: e.target.value,
                })
              }
              disabled={attendanceEditLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Interactions Count</label>
            <input
              type="number"
              min="0"
              className="form-input"
              value={attendanceEditForm.interactionsCount}
              onChange={(e) =>
                setAttendanceEditForm({
                  ...attendanceEditForm,
                  interactionsCount: e.target.value,
                })
              }
              disabled={attendanceEditLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Device Type</label>
            <input
              type="text"
              className="form-input"
              value={attendanceEditForm.deviceType}
              onChange={(e) =>
                setAttendanceEditForm({
                  ...attendanceEditForm,
                  deviceType: e.target.value,
                })
              }
              disabled={attendanceEditLoading}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.5rem',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setAttendanceEditModalOpen(false)}
            disabled={attendanceEditLoading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={attendanceEditLoading}
          >
            {attendanceEditLoading
              ? 'Saving...'
              : '💾 Save Changes'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Session"
        message={`Are you sure you want to delete session "${sessionToDelete?.title}"?`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default Sessions;
