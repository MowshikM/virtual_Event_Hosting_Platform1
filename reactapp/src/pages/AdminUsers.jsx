import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import roleRequestService from '../services/roleRequestService';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';

const AdminUsers = () => {
  const { role } = useAuth();
  const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [success, setSuccess] = useState('');

const [roleRequests, setRoleRequests] = useState([]);
const [roleRequestsLoading, setRoleRequestsLoading] = useState(false);
  // Search, Filter, Sort, Pagination
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [sortBy, setSortBy] = useState('CREATED_DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit User Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    phoneNumber: '',
    profileData: '',
  });
  const [editLoading, setEditLoading] = useState(false);

  // Deactivate Modal State
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  useEffect(() => {
  fetchUsers();
  fetchRoleRequests();
}, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };
  const fetchRoleRequests = async () => {
  setRoleRequestsLoading(true);

  try {
    const data = await roleRequestService.getPendingRequests();
    setRoleRequests(data || []);
  } catch (err) {
    console.error('Failed to load role requests:', err);
  } finally {
    setRoleRequestsLoading(false);
  }
};

  // Backend Search integration
  const handleSearch = useCallback(async (keyword) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);

    if (!keyword.trim()) {
      fetchUsers();
      return;
    }

    try {
      const results = await userService.searchUsers(keyword.trim());
      setUsers(results || []);
    } catch (err) {
      setError('User search failed.');
    }
  }, []);

  // Filter & Sort
  const filteredAndSortedUsers = useMemo(() => {
    let list = [...users];

    // Role filter
    if (roleFilter !== 'ALL') {
      list = list.filter((u) => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter === 'ACTIVE') {
      list = list.filter((u) => u.isActive !== false);
    } else if (statusFilter === 'INACTIVE') {
      list = list.filter((u) => u.isActive === false);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'USERNAME_ASC') {
        return (a.username || '').localeCompare(b.username || '');
      }
      if (sortBy === 'EMAIL_ASC') {
        return (a.email || '').localeCompare(b.email || '');
      }
      // CREATED_DESC
      const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
      const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
      return dateB - dateA;
    });

    return list;
  }, [users, roleFilter, statusFilter, sortBy]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedUsers.slice(start, start + pageSize);
  }, [filteredAndSortedUsers, currentPage, pageSize]);

  // Edit Handlers
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      company: user.company || '',
      jobTitle: user.jobTitle || '',
      phoneNumber: user.phoneNumber || '',
      profileData: user.profileData || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditLoading(true);
    setError('');
    try {
      const updated = await userService.updateUser(editingUser.id, editFormData);
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));
      setSuccess(`Profile for "${editingUser.username}" updated successfully.`);
      setEditModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to update user profile.');
    } finally {
      setEditLoading(false);
    }
  };

  // Deactivate Handlers
  const handleOpenDeactivate = (user) => {
    setUserToDeactivate(user);
    setDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!userToDeactivate) return;
    setDeactivateLoading(true);
    try {
      await userService.deleteUser(userToDeactivate.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userToDeactivate.id ? { ...u, isActive: false } : u
        )
      );
      setSuccess(`User "${userToDeactivate.username}" deactivated successfully.`);
      setDeactivateModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to deactivate user.');
    } finally {
      setDeactivateLoading(false);
    }
  };

  // Activate Handler
  const handleActivateUser = async (userId) => {
    try {
      const updated = await userService.activateUser(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setSuccess(`User "${updated.username}" activated successfully.`);
    } catch (err) {
      setError(err.message || 'Failed to activate user account.');
    }
  };
  
const handleChangeRole = async (user) => {
  const newRole = window.prompt(
    `Enter new role for ${user.username}:\n\nADMIN\nORGANIZER\nATTENDEE\nSPONSOR`
  );

  if (!newRole) return;

  const role = newRole.trim().toUpperCase();

  const allowedRoles = [
    "ADMIN",
    "ORGANIZER",
    "ATTENDEE",
    "SPONSOR"
  ];

  if (!allowedRoles.includes(role)) {
    alert("Invalid role. Please enter ADMIN, ORGANIZER, ATTENDEE, or SPONSOR.");
    return;
  }

  try {
    await userService.updateUserRole(user.id, role);

    alert(`Role changed to ${role} successfully.`);

    // Refresh the user list
    fetchUsers();
  } catch (error) {
    console.error("Role change failed:", error);
    alert("Failed to change user role.");
  }
};
const handleApproveRoleRequest = async (requestId) => {
  try {
    await roleRequestService.approveRequest(requestId);

    setSuccess('Role request approved successfully.');

    // Refresh pending requests
    fetchRoleRequests();

    // Refresh users so the new role is displayed
    fetchUsers();
  } catch (err) {
    setError(err.message || 'Failed to approve role request.');
  }
};

const handleRejectRoleRequest = async (requestId) => {
  try {
    await roleRequestService.rejectRequest(requestId);

    setSuccess('Role request rejected successfully.');

    // Refresh pending requests
    fetchRoleRequests();
  } catch (err) {
    setError(err.message || 'Failed to reject role request.');
  }
};
  const getRoleBadgeClass = (r) => {
    switch (r) {
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
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin User Management</h1>
          <p className="page-subtitle">
            Oversee platform accounts, assign delegate profiles, and manage role authorizations.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} onRetry={fetchUsers} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />
        {/* Role Requests */}
<div
  className="glass-card"
  style={{
    padding: '2rem',
    marginBottom: '2rem',
  }}
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
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
        Role Requests
      </h2>

      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          marginTop: '0.35rem',
        }}
      >
        Review pending requests from attendees who want to become
        organizers or sponsors.
      </p>
    </div>

    <span className="badge badge-warning">
      {roleRequests.length} Pending
    </span>
  </div>

  {roleRequestsLoading ? (
    <LoadingSpinner text="Loading role requests..." />
  ) : roleRequests.length === 0 ? (
    <p
      style={{
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
      }}
    >
      No pending role requests.
    </p>
  ) : (
    <div className="table-responsive">
      <table className="custom-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Requested Role</th>
            <th>Reason</th>
            <th>Requested On</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {roleRequests.map((request) => (
            <tr key={request.id}>
              <td>
                {request.user?.username || 'Unknown User'}
              </td>

              <td>
                {request.user?.email || '—'}
              </td>

              <td>
                <span
                  className={`badge ${
                    request.requestedRole === 'ORGANIZER'
                      ? 'badge-organizer'
                      : 'badge-sponsor'
                  }`}
                >
                  {request.requestedRole}
                </span>
              </td>

              <td>
                {request.reason || '—'}
              </td>

              <td>
                {request.requestedAt
                  ? new Date(request.requestedAt).toLocaleString()
                  : '—'}
              </td>
              <td>
  <div style={{ display: 'flex', gap: '0.5rem' }}>
    <button
      type="button"
      className="btn btn-sm btn-primary"
      onClick={() => handleApproveRoleRequest(request.id)}
      disabled={roleRequestsLoading}
    >
      Approve
    </button>

    <button
      type="button"
      className="btn btn-sm btn-danger"
      onClick={() => handleRejectRoleRequest(request.id)}
      disabled={roleRequestsLoading}
    >
      Reject
    </button>
  </div>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

      {/* Control Bar */}
      <div className="control-bar">
        <SearchBar
          value={searchKeyword}
          onChange={handleSearch}
          onClear={() => handleSearch('')}
          placeholder="Search by username, email, full name, or company..."
          style={{ maxWidth: '380px' }}
        />

        <div className="filters-group">
          {/* Role Filter */}
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 'auto', minWidth: '130px' }}
            aria-label="Filter by role"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="ORGANIZER">ORGANIZER</option>
            <option value="ATTENDEE">ATTENDEE</option>
            <option value="SPONSOR">SPONSOR</option>
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 'auto', minWidth: '130px' }}
            aria-label="Filter by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="INACTIVE">Deactivated</option>
          </select>

          {/* Sort Selection */}
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 'auto', minWidth: '150px' }}
            aria-label="Sort users"
          >
            <option value="CREATED_DESC">Date: Newest First</option>
            <option value="USERNAME_ASC">Username: A → Z</option>
            <option value="EMAIL_ASC">Email: A → Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching user accounts..." />
      ) : paginatedUsers.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No users found"
          description="No user accounts match your search or filter criteria."
        />
      ) : (
        <>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact Email</th>
                  <th>Full Name</th>
                  <th>Company & Title</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => {
                  const isActive = u.isActive !== false;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              color: '#ffffff',
                            }}
                          >
                            {u.username ? u.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <strong style={{ color: '#ffffff' }}>{u.username}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              ID #{u.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        {u.firstName || u.lastName
                          ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
                          : '—'}
                      </td>
                      <td>
                        {u.company || u.jobTitle ? (
                          <div>
                            <div>{u.company || ''}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {u.jobTitle || ''}
                            </div>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
                          {isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>
                        {u.createdDate ? new Date(u.createdDate).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                           {role === 'SUPER_ADMIN' && u.role !== 'SUPER_ADMIN' && (
  <button
    type="button"
    className="btn btn-sm btn-primary"
    onClick={() => handleChangeRole(u)}
    title="Change User Role"
  >
    Change Role
  </button>
)}
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary btn-icon"
                            onClick={() => handleOpenEdit(u)}
                            title="Edit User Profile"
                            aria-label="Edit User Profile"
                          >
                            ✏️
                          </button>

                          {isActive ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-danger btn-icon"
                              onClick={() => handleOpenDeactivate(u)}
                              title="Deactivate User"
                              aria-label="Deactivate User"
                            >
                              🚫
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-primary btn-icon"
                              onClick={() => handleActivateUser(u.id)}
                              title="Activate User"
                              aria-label="Activate User"
                            >
                              ✓
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredAndSortedUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            itemLabel="users"
          />
        </>
      )}

      {/* Edit User Profile Modal (No password field!) */}
      {editModalOpen && editingUser && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem', color: '#ffffff' }}>
              Edit User Profile: {editingUser.username}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Update contact info and professional details.
            </p>

            <form onSubmit={handleSaveUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Company / Organization</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.company}
                    onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.jobTitle}
                    onChange={(e) => setEditFormData({ ...editFormData, jobTitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profile Bio / Background</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={editFormData.profileData}
                  onChange={(e) => setEditFormData({ ...editFormData, profileData: e.target.value })}
                  placeholder="Professional bio, area of expertise..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditModalOpen(false)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate User Modal */}
      <ConfirmModal
        isOpen={deactivateModalOpen}
        title="Deactivate User Account"
        message={`Are you sure you want to deactivate account for "${userToDeactivate?.username}"? The user will be marked inactive.`}
        confirmText="Deactivate User"
        confirmVariant="danger"
        loading={deactivateLoading}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeactivateModalOpen(false)}
      />
    </div>
  );
};

export default AdminUsers;
