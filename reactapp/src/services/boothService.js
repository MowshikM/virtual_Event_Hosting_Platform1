import API from './api';

export const boothService = {
  createBooth: async (boothData) => {
    const response = await API.post('/booths', boothData);
    return response.data;
  },

  getAllBooths: async () => {
    const response = await API.get('/booths');
    return response.data;
  },

  getBoothById: async (id) => {
    const response = await API.get(`/booths/${id}`);
    return response.data;
  },

  getBoothsByEvent: async (eventId) => {
    const response = await API.get(`/booths/event/${eventId}`);
    return response.data;
  },

  updateBooth: async (id, boothData) => {
    const response = await API.put(`/booths/${id}`, boothData);
    return response.data;
  },

  recordVisit: async (id) => {
    const response = await API.post(`/booths/${id}/visit`);
    return response.data;
  },

  recordLead: async (id) => {
    const response = await API.post(`/booths/${id}/lead`);
    return response.data;
  },

  deleteBooth: async (id) => {
    const response = await API.delete(`/booths/${id}`);
    return response.data;
  },

  getBoothVisitors: async (id) => {
    const response = await API.get(`/booths/${id}/visitors`);
    return response.data;
  },

  getBoothLeads: async (id) => {
    const response = await API.get(`/booths/${id}/leads`);
    return response.data;
  },
};

export default boothService;