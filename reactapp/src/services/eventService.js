import API from './api';

export const eventService = {
  getAllEvents: async () => {
    const response = await API.get('/events');
    return response.data;
  },

  getEventById: async (id) => {
    const response = await API.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (eventData) => {
    // eventData: { title, description, dateTime, eventLink, organizerId }
    const response = await API.post('/events', eventData);
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await API.put(`/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await API.delete(`/events/${id}`);
    return response.data;
  },

  searchEvents: async (keyword) => {
    const response = await API.get('/events/search', {
      params: { keyword }
    });
    return response.data;
  }
};

export default eventService;