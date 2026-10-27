import API from './api';

export const registrationService = {
  register: async (registrationData) => {
    // registrationData: { eventId, registrationType, paymentStatus, paymentAmount, customFields }
    const response = await API.post('/registrations', registrationData);
    return response.data;
  },

  getAllRegistrations: async () => {
    const response = await API.get('/registrations');
    return response.data;
  },

  getRegistrationById: async (id) => {
    const response = await API.get(`/registrations/${id}`);
    return response.data;
  },

  getRegistrationsByEvent: async (eventId) => {
    const response = await API.get(`/registrations/event/${eventId}`);
    return response.data;
  },

  getRegistrationsByAttendee: async (attendeeId) => {
    const response = await API.get(`/registrations/attendee/${attendeeId}`);
    return response.data;
  },

  cancelRegistration: async (id) => {
    const response = await API.delete(`/registrations/${id}`);
    return response.data;
  }
};

export default registrationService;
