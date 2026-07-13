package com.examly.springapp.service;

import java.util.List;

import com.examly.springapp.dto.SessionAttendanceRequest;
import com.examly.springapp.dto.SessionAttendanceResponse;

public interface SessionAttendanceService {

    // Create Attendance
    SessionAttendanceResponse recordAttendance(SessionAttendanceRequest request);

    // Get All Attendance
    List<SessionAttendanceResponse> getAllAttendance();

    // Get Attendance By Id
    SessionAttendanceResponse getAttendanceById(Long id);

    // Get Attendance By Session
    List<SessionAttendanceResponse> getAttendanceBySession(Long sessionId);

    // Get Attendance By Attendee
    List<SessionAttendanceResponse> getAttendanceByAttendee(Long attendeeId);

    // Update Attendance
    SessionAttendanceResponse updateAttendance(Long id, SessionAttendanceRequest request);

    // Delete Attendance
    void deleteAttendance(Long id);
}