import API from './api';

export const roleRequestService = {
  createRequest: async (requestedRole, reason) => {
    const response = await API.post('/role-requests', {
      requestedRole,
      reason,
    });

    return response.data;
  },

  getMyRequests: async () => {
    const response = await API.get('/role-requests/my');
    return response.data;
  },
    getPendingRequests: async () => {
    const response = await API.get('/role-requests/pending');
    return response.data;
  },

  approveRequest: async (requestId) => {
    const response = await API.put(
      `/role-requests/${requestId}/approve`
    );
    return response.data;
  },

  rejectRequest: async (requestId) => {
    const response = await API.put(
      `/role-requests/${requestId}/reject`
    );
    return response.data;
  },
};

export default roleRequestService;