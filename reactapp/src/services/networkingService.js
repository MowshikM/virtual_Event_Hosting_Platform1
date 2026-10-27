import API from './api';

export const networkingService = {
  requestConnection: async (connectionData) => {
    // connectionData: { eventId, recipientId, connectionType, message, meetingTime }
    const response = await API.post('/connections', connectionData);
    return response.data;
  },

  getAllConnections: async () => {
    const response = await API.get('/connections');
    return response.data;
  },

  getConnectionById: async (id) => {
    const response = await API.get(`/connections/${id}`);
    return response.data;
  },

  getMyConnections: async () => {
    const response = await API.get('/connections/me');
    return response.data;
  },

  respondToConnection: async (id, status) => {
    // status: 'ACCEPTED' or 'REJECTED'
    const response = await API.put(`/connections/${id}/respond`, null, {
      params: { status }
    });
    return response.data;
  },

  deleteConnection: async (id) => {
    const response = await API.delete(`/connections/${id}`);
    return response.data;
  }
};

export default networkingService;
