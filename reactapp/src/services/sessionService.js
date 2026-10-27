import API from './api';

export const sessionService = {
  getAllSessions: async () => {
    const response = await API.get('/sessions');
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await API.get(`/sessions/${id}`);
    return response.data;
  },

  getSessionsByEvent: async (eventId) => {
    const response = await API.get(`/sessions/event/${eventId}`);
    return response.data;
  },
joinStream: async (id) => {
  const response = await API.get(`/sessions/${id}/join-stream`);
  return response.data;
},
  createSession: async (sessionData) => {
    const response = await API.post('/sessions', sessionData);
    return response.data;
  },

  updateSession: async (id, sessionData) => {
    const response = await API.put(`/sessions/${id}`, sessionData);
    return response.data;
  },

  deleteSession: async (id) => {
    const response = await API.delete(`/sessions/${id}`);
    return response.data;
  }
};

export default sessionService;
