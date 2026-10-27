import API from './api';

export const analyticsService = {
  recordAnalytics: async (analyticsData) => {
    // analyticsData: { eventId, sessionId, userId, engagementType, engagementData, durationSeconds }
    const response = await API.post('/analytics', analyticsData);
    return response.data;
  },

  getAllAnalytics: async () => {
    const response = await API.get('/analytics');
    return response.data;
  },

  getAnalyticsById: async (id) => {
    const response = await API.get(`/analytics/${id}`);
    return response.data;
  },

  getAnalyticsByEvent: async (eventId) => {
    const response = await API.get(`/analytics/event/${eventId}`);
    return response.data;
  },

  getAnalyticsBySession: async (sessionId) => {
    const response = await API.get(`/analytics/session/${sessionId}`);
    return response.data;
  },

  getAnalyticsByUser: async (userId) => {
    const response = await API.get(`/analytics/user/${userId}`);
    return response.data;
  }
};

export default analyticsService;
