import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import boothService from '../services/boothService';
import eventService from '../services/eventService';
import userService from '../services/userService';
import BoothCard from '../components/BoothCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';

const VirtualBooths = () => {
  const { isAuthenticated, role, userId } = useAuth();
  const [booths, setBooths] = useState([]);
  const [events, setEvents] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [selectedBooth, setSelectedBooth] = useState(null);
const [visitors, setVisitors] = useState([]);
const [leads, setLeads] = useState([]);
const [detailsLoading, setDetailsLoading] = useState(false);
  const [organizerEventIds, setOrganizerEventIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Create / Edit Booth Modal State
  const [boothModalOpen, setBoothModalOpen] = useState(false);
  const [editingBooth, setEditingBooth] = useState(null);
  const [formData, setFormData] = useState({
  eventId: '',
  sponsorId: '',
  boothName: '',
  companyWebsiteUrl: '',
  boothConfig: '',
  brandingConfig: '',
  staffMembers: '',
});
  const [modalLoading, setModalLoading] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [boothToDelete, setBoothToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Interaction loading
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  setLoading(true);
  setError('');

  try {
    const [boothsData, eventsData] = await Promise.all([
      boothService.getAllBooths(),
      eventService.getAllEvents().catch(() => []),
    ]);

    setBooths(boothsData || []);
    setEvents(eventsData || []);

    // Store event IDs owned by the logged-in organizer
    if (role === 'ORGANIZER') {
      const myEventIds = (eventsData || [])
        .filter(
          (event) =>
            event.organizerId &&
            String(event.organizerId) === String(userId)
        )
        .map((event) => Number(event.id));

      setOrganizerEventIds(myEventIds);
    }

    // Admin and SuperAdmin can select sponsors
   if (
  role === 'ADMIN' ||
  role === 'SUPER_ADMIN' ||
  role === 'ORGANIZER'
) {
      const users = await userService.getAllUsers().catch(() => []);

      setSponsors(
        users.filter(
          (u) =>
            u.role === 'SPONSOR' ||
            u.role === 'ORGANIZER' ||
            u.role === 'ADMIN'
        )
      );
    }
  } catch (err) {
    setError(err.message || 'Failed to load virtual booths.');
  } finally {
    setLoading(false);
  }
};

  const filteredBooths = useMemo(() => {
  return booths.filter((b) => {

    // Sponsor can see only their own booth
    if (
      role === 'SPONSOR' &&
      String(b.sponsorId) !== String(userId)
    ) {

      return false;
    }
      const matchesSearch =
        searchKeyword === '' ||
        (b.boothName && b.boothName.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (b.brandingConfig && b.brandingConfig.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (b.staffMembers && b.staffMembers.toLowerCase().includes(searchKeyword.toLowerCase()));

      const matchesEvent =
        selectedEventId === 'ALL' || String(b.eventId) === String(selectedEventId);

      return matchesSearch && matchesEvent;
    });
  }, [booths, searchKeyword, selectedEventId, role, userId]);
  const sponsorBooths = useMemo(() => {
  if (role !== 'SPONSOR') {
    return [];
  }

  return booths.filter(
    (booth) => String(booth.sponsorId) === String(userId)
  );
}, [booths, role, userId]);

const sponsorVisitors = sponsorBooths.reduce(
  (total, booth) => total + (booth.visitCount || 0),
  0
);

const sponsorLeads = sponsorBooths.reduce(
  (total, booth) => total + (booth.leadCount || 0),
  0
);

const sponsorConversion =
  sponsorVisitors > 0
    ? ((sponsorLeads / sponsorVisitors) * 100).toFixed(1)
    : '0.0';

  const paginatedBooths = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooths.slice(start, start + pageSize);
  }, [filteredBooths, currentPage, pageSize]);

  // Visit Booth Handler
 const handleVisitBooth = async (boothId) => {
  setActionLoadingId(boothId);

  try {
    const updated = await boothService.recordVisit(boothId);

    setBooths((prev) =>
      prev.map((b) => (b.id === boothId ? updated : b))
    );

    setSuccess('Visited booth! Opening company website...');

    if (updated.companyWebsiteUrl) {
      const websiteUrl = /^https?:\/\//i.test(updated.companyWebsiteUrl)
        ? updated.companyWebsiteUrl
        : `https://${updated.companyWebsiteUrl}`;

      window.open(websiteUrl, '_blank', 'noopener,noreferrer');
    }
  } catch (err) {
    setError(err.message || 'Could not record booth visit.');
  } finally {
    setActionLoadingId(null);
  }
};

  // Drop Lead Handler
  const handleDropLead = async (boothId) => {
    setActionLoadingId(boothId);
    try {
      const updated = await boothService.recordLead(boothId);
      setBooths((prev) => prev.map((b) => (b.id === boothId ? updated : b)));
      setSuccess('Contact information shared with the exhibitor!');
    } catch (err) {
      setError(err.message || 'Could not drop lead.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Create / Edit Open Handlers

const handleOpenCreate = () => {
  setEditingBooth(null);

  setFormData({
  eventId: events.length > 0 ? String(events[0].id) : '',
  sponsorId: sponsors.length > 0 ? String(sponsors[0].id) : '',
  boothName: '',
  companyWebsiteUrl: '',
  boothConfig: '',
  brandingConfig: '',
  staffMembers: '',
});

  setBoothModalOpen(true);
};

  const handleOpenEdit = (booth) => {
    setEditingBooth(booth);
   setFormData({
  eventId: booth.eventId ? String(booth.eventId) : '',
  sponsorId: booth.sponsorId
    ? String(booth.sponsorId)
    : String(userId),
  boothName: booth.boothName || '',
  companyWebsiteUrl: booth.companyWebsiteUrl || '',
  boothConfig: booth.boothConfig || '',
  brandingConfig: booth.brandingConfig || '',
  staffMembers: booth.staffMembers || '',
});
    setBoothModalOpen(true);
  };
  const handleViewBoothDetails = async (booth) => {
  setSelectedBooth(booth);
  setDetailsLoading(true);

  try {
    const [visitorsData, leadsData] = await Promise.all([
      boothService.getBoothVisitors(booth.id),
      boothService.getBoothLeads(booth.id),
    ]);

    setVisitors(visitorsData || []);
    setLeads(leadsData || []);
  } catch (err) {
    setError(err.message || 'Failed to load booth details.');
    setVisitors([]);
    setLeads([]);
  } finally {
    setDetailsLoading(false);
  }
};

  const handleSaveBooth = async (e) => {
  e.preventDefault();

  if (formData.companyWebsiteUrl.trim()) {
    try {
      const url = new URL(formData.companyWebsiteUrl.trim());

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        setError('Please enter a valid company website URL.');
        return;
      }
    } catch {
      setError('Please enter a valid company website URL.');
      return;
    }
  }

  setModalLoading(true);
  setError('');
    try {
      const payload = {
  eventId: Number(formData.eventId),
  sponsorId: Number(formData.sponsorId),
  boothName: formData.boothName.trim(),
  companyWebsiteUrl: formData.companyWebsiteUrl.trim(),
  boothConfig: formData.boothConfig.trim(),
  brandingConfig: formData.brandingConfig.trim(),
  staffMembers: formData.staffMembers.trim(),
};

      if (editingBooth) {
        const updated = await boothService.updateBooth(editingBooth.id, payload);
        setBooths((prev) => prev.map((b) => (b.id === editingBooth.id ? updated : b)));
        setSuccess('Booth updated successfully.');
      } else {
        const created = await boothService.createBooth(payload);
        setBooths((prev) => [created, ...prev]);
        setSuccess('Expo booth created successfully.');
      }

      setBoothModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to save booth details.');
    } finally {
      setModalLoading(false);
    }
  };

  // Delete Handlers
  const handleOpenDelete = (booth) => {
    setBoothToDelete(booth);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!boothToDelete) return;
    setDeleteLoading(true);
    try {
      await boothService.deleteBooth(boothToDelete.id);
      setBooths((prev) => prev.filter((b) => b.id !== boothToDelete.id));
      setSuccess('Booth removed from the expo hall.');
      setDeleteModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to delete booth.');
    } finally {
      setDeleteLoading(false);
    }
  };

 const canManage =
  isAuthenticated &&
  (role === 'ADMIN' ||
    role === 'SUPER_ADMIN' ||
    role === 'ORGANIZER');

const canManageBooth = (booth) => {
  if (!isAuthenticated) {
    return false;
  }

  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return true;
  }

  if (role === 'SPONSOR') {
    return String(booth.sponsorId) === String(userId);
  }

  if (role === 'ORGANIZER') {
    return organizerEventIds.includes(Number(booth.eventId));
  }

  return false;
};
  return (
    <div>
      {role === 'SPONSOR' && (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    }}
  >
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ color: 'var(--text-muted)' }}>
        👀 Total Visitors
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800 }}>
        {sponsorVisitors}
      </div>
    </div>

    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ color: 'var(--text-muted)' }}>
        🎯 Total Leads
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800 }}>
        {sponsorLeads}
      </div>
    </div>

    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ color: 'var(--text-muted)' }}>
        📈 Conversion Rate
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800 }}>
        {sponsorConversion}%
      </div>
    </div>

    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ color: 'var(--text-muted)' }}>
        🏢 My Booths
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800 }}>
        {sponsorBooths.length}
      </div>
    </div>
  </div>
)}
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Virtual Expo & Sponsor Hall</h1>
          <p className="page-subtitle">
            Connect directly with leading industry sponsors, explore product demos, and exchange contact information.
          </p>
        </div>

        {canManage && (
          <button type="button" className="btn btn-accent" onClick={handleOpenCreate}>
            ➕ Add Sponsor Booth
          </button>
        )}
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} onRetry={fetchData} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />

      {/* Control Bar */}
      <div className="control-bar">
        <SearchBar
          value={searchKeyword}
          onChange={(val) => {
            setSearchKeyword(val);
            setCurrentPage(1);
          }}
          onClear={() => setSearchKeyword('')}
          placeholder="Search expo hall by company, brand, or booth staff..."
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
              aria-label="Filter booths by event"
            >
              <option value="ALL">All Events</option>
              {events
  .filter((ev) => {
    if (role === 'ATTENDEE') {
      return booths.some(
        (booth) => String(booth.eventId) === String(ev.id)
      );
    }

    return true;
  })
  .map((ev) => (
    <option key={ev.id} value={ev.id}>
      {ev.title}
    </option>
  ))}
            </select>
          )}
        </div>
      </div>

      {/* Booths Grid */}
      {loading ? (
        <LoadingSpinner text="Loading virtual expo hall..." />
      ) : paginatedBooths.length === 0 ? (
        <EmptyState
          icon="🏢"
          title="No expo booths available"
          description="There are currently no sponsor booths matching your selection."
          actionText={canManage ? 'Set Up an Expo Booth' : undefined}
          onAction={canManage ? handleOpenCreate : undefined}
        />
      ) : (
        <>
          <div className="grid-cards">
            {paginatedBooths.map((b) => (
              <BoothCard
  key={b.id}
  booth={b}
  onVisit={handleVisitBooth}
  onDropLead={handleDropLead}
onViewDetails={
  role !== 'ATTENDEE' && canManageBooth(b)
    ? handleViewBoothDetails
    : undefined
}  onEdit={canManageBooth(b) ? handleOpenEdit : undefined}
onDelete={
  canManageBooth(b) && role !== 'SPONSOR'
    ? handleOpenDelete
    : undefined
}  isActionLoading={actionLoadingId === b.id}
/>  
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredBooths.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            itemLabel="booths"
          />
        </>
      )}

      {/* Create / Edit Booth Modal */}
      {boothModalOpen && (
        <div className="modal-overlay" onClick={() => setBoothModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem', color: '#ffffff' }}>
              {editingBooth ? 'Edit Sponsor Booth' : 'Set Up Sponsor Booth'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Configure branding tags, virtual showcase details, and booth staff.
            </p>

            <form onSubmit={handleSaveBooth}>
              <div className="form-group">
                <label className="form-label">Event <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  required
                >
                  <option value="">Select an Event</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Booth / Sponsor Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.boothName}
                  onChange={(e) => setFormData({ ...formData, boothName: e.target.value })}
                  placeholder="e.g. Acme Cloud Corp"
                  required
                />
              </div>
              <div className="form-group">
  <label className="form-label">
    Sponsor <span className="required">*</span>
  </label>

  {role === 'SPONSOR' ? (
    <input
      type="text"
      className="form-input"
      value={`My Sponsor (ID: ${userId})`}
      disabled
    />
  ) : (
    <select
      className="form-select"
      value={formData.sponsorId}
      onChange={(e) =>
        setFormData({
          ...formData,
          sponsorId: e.target.value,
        })
      }
      required
    >
      
      <option value="">Select a Sponsor</option>

      {sponsors
        .filter((sponsor) => sponsor.role === 'SPONSOR')
        .map((sponsor) => (
          <option key={sponsor.id} value={sponsor.id}>
            {sponsor.company || sponsor.username || sponsor.email}
          </option>
        ))}
    </select>
  )}
</div>
              <div className="form-group">
                <label className="form-label">Branding Headline / Tagline</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.brandingConfig}
                  onChange={(e) => setFormData({ ...formData, brandingConfig: e.target.value })}
                  placeholder="e.g. Next-Generation Distributed Infrastructure"
                />
              </div>
              <div className="form-group">
  <label className="form-label">Company Website URL</label>
  <input
    type="url"
    className="form-input"
    value={formData.companyWebsiteUrl}
    onChange={(e) =>
      setFormData({
        ...formData,
        companyWebsiteUrl: e.target.value,
      })
    }
    placeholder="https://www.example.com"
  />
</div>

              <div className="form-group">
                <label className="form-label">Booth Showcase Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.boothConfig}
                  onChange={(e) => setFormData({ ...formData, boothConfig: e.target.value })}
                  placeholder="Describe your company offerings, product demos, and giveaways..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Booth Staff Members</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.staffMembers}
                  onChange={(e) => setFormData({ ...formData, staffMembers: e.target.value })}
                  placeholder="e.g. Sarah Connor (Product Manager), John Doe (Sales Lead)"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBoothModalOpen(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : 'Save Booth'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Expo Booth"
        message={`Are you sure you want to remove booth "${boothToDelete?.boothName}" from the expo hall?`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {selectedBooth && (
  <div
    className="modal-overlay"
    onClick={() => setSelectedBooth(null)}
  >
    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()}
      style={{ maxWidth: '900px', width: '95%' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2>👥 Booth Visitors & Leads</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            {selectedBooth.boothName}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setSelectedBooth(null)}
        >
          ✕ Close
        </button>
      </div>

      {detailsLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading visitors and leads...
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
          }}
        >
          {/* VISITORS */}
          <div className="glass-card" style={{ padding: '1rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>
              👀 Visitors ({visitors.length})
            </h3>

            {visitors.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>
                No visitors yet.
              </p>
            ) : (
              visitors.map((visitor) => (
                <div
                  key={`${visitor.userId}-${visitor.visitedAt}`}
                  style={{
                    padding: '0.75rem 0',
                    borderBottom:
                      '1px solid rgba(148, 163, 184, 0.1)',
                  }}
                >
                  <strong>
                    {visitor.firstName || ''}{' '}
                    {visitor.lastName || ''}
                  </strong>

                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {visitor.email}
                  </div>

                  {visitor.company && (
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                      {visitor.company}
                    </div>
                  )}

                  {visitor.jobTitle && (
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                      {visitor.jobTitle}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* LEADS */}
          <div className="glass-card" style={{ padding: '1rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>
              🎯 Leads ({leads.length})
            </h3>

            {leads.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>
                No leads yet.
              </p>
            ) : (
              leads.map((lead) => (
                <div
                  key={`${lead.userId}-${lead.createdAt}`}
                  style={{
                    padding: '0.75rem 0',
                    borderBottom:
                      '1px solid rgba(148, 163, 184, 0.1)',
                  }}
                >
                  <strong>
                    {lead.firstName || ''}{' '}
                    {lead.lastName || ''}
                  </strong>

                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {lead.email}
                  </div>

                  {lead.company && (
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                      {lead.company}
                    </div>
                  )}

                  {lead.jobTitle && (
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                      {lead.jobTitle}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  </div>
)}
    </div>
  );
};

export default VirtualBooths;
