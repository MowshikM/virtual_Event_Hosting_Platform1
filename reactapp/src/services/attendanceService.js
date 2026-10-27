import API from './api';

export const attendanceService = {
  recordAttendance: async (attendanceData) => {
    // attendanceData: { sessionId, attendeeId, joinTime, leaveTime, durationMinutes, engagementScore, interactionsCount, deviceType }
    const response = await API.post('/attendance', attendanceData);
    return response.data;
  },

  getAllAttendance: async () => {
    const response = await API.get('/attendance');
    return response.data;
  },

  getAttendanceById: async (id) => {
    const response = await API.get(`/attendance/${id}`);
    return response.data;
  },

  getAttendanceBySession: async (sessionId) => {
    const response = await API.get(`/attendance/session/${sessionId}`);
    return response.data;
  },

  getAttendanceByAttendee: async (attendeeId) => {
    const response = await API.get(`/attendance/attendee/${attendeeId}`);
    return response.data;
  },

  updateAttendance: async (id, attendanceData) => {
    const response = await API.put(`/attendance/${id}`, attendanceData);
    return response.data;
  },

  deleteAttendance: async (id) => {
    const response = await API.delete(`/attendance/${id}`);
    return response.data;
  }
};

export default attendanceService;
