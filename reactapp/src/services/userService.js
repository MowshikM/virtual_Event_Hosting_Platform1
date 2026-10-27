import API from './api';

export const userService = {
  getAllUsers: async () => {
    const response = await API.get('/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await API.get(`/users/${id}`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await API.get('/users/me');
    return response.data;
  },

  updateUser: async (id, userData) => {
    // userData: { firstName, lastName, company, jobTitle, phoneNumber, profileData }
    const response = await API.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    // Soft deactivation
    const response = await API.delete(`/users/${id}`);
    return response.data;
  },

  activateUser: async (id) => {
    const response = await API.put(`/users/${id}/activate`);
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await API.put(`/users/${id}/role`, {
      role: role
    });

    return response.data;
  },

  searchUsers: async (keyword) => {
    const response = await API.get('/users/search', {
      params: { keyword }
    });
    return response.data;
  }
};

export default userService;