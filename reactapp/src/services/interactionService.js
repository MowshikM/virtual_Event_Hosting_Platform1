import API from './api';

export const interactionService = {
  createInteraction: async (interactionData) => {
    // interactionData: { sessionId, interactionType, content, metadata }
    const response = await API.post('/interactions', interactionData);
    return response.data;
  },

  getAllInteractions: async () => {
    const response = await API.get('/interactions');
    return response.data;
  },

  getInteractionById: async (id) => {
    const response = await API.get(`/interactions/${id}`);
    return response.data;
  },

  getInteractionsBySession: async (sessionId) => {
    const response = await API.get(`/interactions/session/${sessionId}`);
    return response.data;
  },

  moderateInteraction: async (id, approved) => {
    // approved: true or false
    const response = await API.put(`/interactions/${id}/moderate`, null, {
      params: { approved }
    });
    return response.data;
  },

  deleteInteraction: async (id) => {
    const response = await API.delete(`/interactions/${id}`);
    return response.data;
  }
};

export default interactionService;
