import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';

const Events = () => {
 const { role } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search, Filter, Sort, Pagination states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL' | 'UPCOMING' | 'PAST'
  const [organizerFilter, setOrganizerFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DATE_ASC'); // 'DATE_ASC' | 'DATE_DESC' | 'TITLE_ASC' | 'TITLE_DESC'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Modal states for delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // RSVP state

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventService.getAllEvents();
      setEvents(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load events.');
    } finally {
      setLoading(false);
    }
  };

  // Backend Search integration
  const handleSearch = useCallback(async (keyword) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);

    if (!keyword.trim()) {
      fetchEvents();
      return;
    }

    try {
      const results = await eventService.searchEvents(keyword.trim());
      setEvents(results || []);
    } catch (err) {
      setError('Search query failed.');
    }
  }, []);

  // Filter & Sort logic
  const filteredAndSortedEvents = useMemo(() => {
    let list = [...events];
    const now = new Date();

    // Time filter
    if (timeFilter === 'UPCOMING') {
      list = list.filter((e) => e.dateTime && new Date(e.dateTime) >= now);
    } else if (timeFilter === 'PAST') {
      list = list.filter((e) => e.dateTime && new Date(e.dateTime) < now);
    }

    // Organizer filter
    if (organizerFilter !== 'ALL') {
      list = list.filter((e) => e.organizerName === organizerFilter);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'TITLE_ASC') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'TITLE_DESC') {
        return (b.title || '').localeCompare(a.title || '');
      }
      if (sortBy === 'DATE_DESC') {
        const dateA = a.dateTime ? new Date(a.dateTime).getTime() : 0;
        const dateB = b.dateTime ? new Date(b.dateTime).getTime() : 0;
        return dateB - dateA;
      }
      // Default: DATE_ASC
      const dateA = a.dateTime ? new Date(a.dateTime).getTime() : 0;
      const dateB = b.dateTime ? new Date(b.dateTime).getTime() : 0;
      return dateA - dateB;
    });

    return list;
  }, [events, timeFilter, organizerFilter, sortBy]);

  // Unique organizers for filter dropdown
  const uniqueOrganizers = useMemo(() => {
    const orgs = new Set();
    events.forEach((e) => {
      if (e.organizerName) orgs.add(e.organizerName);
    });
    return Array.from(orgs);
  }, [events]);

  // Pagination slice
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedEvents.slice(start, start + pageSize);
  }, [filteredAndSortedEvents, currentPage, pageSize]);

  
  

  // Delete handlers
  const handleOpenDelete = (event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setDeleteLoading(true);
    setError('');
    try {
      await eventService.deleteEvent(eventToDelete.id);
      setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
      setSuccess(`Event "${eventToDelete.title}" deleted successfully.`);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete the event.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      {/* Page Title & Actions */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Virtual Events Catalog</h1>
          <p className="page-subtitle">
            Discover upcoming conferences, webinars, hackathons, and virtual summits.
          </p>
        </div>

        {(role === 'ADMIN' || role === 'SUPER_ADMIN' ||role === 'ORGANIZER') && (
          <Link to="/events/new" className="btn btn-primary">
            ➕ Create New Event
          </Link>
        )}
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} onRetry={fetchEvents} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />

      {/* Filter & Control Bar */}
      <div className="control-bar">
        <SearchBar
          value={searchKeyword}
          onChange={handleSearch}
          onClear={() => handleSearch('')}
          placeholder="Search by event title or description..."
          style={{ maxWidth: '380px' }}
        />

        <div className="filters-group">
          {/* Time Filter */}
          <select
            className="form-select"
            value={timeFilter}
            onChange={(e) => {
              setTimeFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter events by time"
            style={{ width: 'auto', minWidth: '130px' }}
          >
            <option value="ALL">All Dates</option>
            <option value="UPCOMING">Upcoming Only</option>
            <option value="PAST">Past Events</option>
          </select>

          {/* Organizer Filter */}
          {uniqueOrganizers.length > 0 && (
            <select
              className="form-select"
              value={organizerFilter}
              onChange={(e) => {
                setOrganizerFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by organizer"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="ALL">All Organizers</option>
              {uniqueOrganizers.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          )}

          {/* Sort Selection */}
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Sort events"
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="DATE_ASC">Date: Earliest First</option>
            <option value="DATE_DESC">Date: Latest First</option>
            <option value="TITLE_ASC">Title: A → Z</option>
            <option value="TITLE_DESC">Title: Z → A</option>
          </select>
        </div>
      </div>

      {/* Events Content */}
      {loading ? (
        <LoadingSpinner text="Fetching virtual events..." />
      ) : paginatedEvents.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No events found"
          description={
            searchKeyword || timeFilter !== 'ALL' || organizerFilter !== 'ALL'
              ? 'Try changing your search or filter parameters to find more events.'
              : 'There are currently no events registered on the platform.'
          }
          actionText={
  (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'ORGANIZER')
    ? 'Create an Event'
    : undefined
}
onAction={
  (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'ORGANIZER')
    ? () => navigate('/events/new')
    : undefined
}
        />
      ) : (
        <>
          <div className="grid-cards">
            {paginatedEvents.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                
                onEdit={(event) => navigate(`/events/${event.id}/edit`)}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredAndSortedEvents.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            itemLabel="events"
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Virtual Event"
        message={`Are you sure you want to delete "${eventToDelete?.title}"? This action will permanently remove the event and cannot be undone.`}
        confirmText="Delete Event"
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setEventToDelete(null);
        }}
      />
    </div>
  );
};

export default Events;
