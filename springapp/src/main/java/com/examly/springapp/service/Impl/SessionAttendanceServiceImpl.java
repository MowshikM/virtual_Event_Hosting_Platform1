package com.examly.springapp.service.Impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.examly.springapp.dto.SessionAttendanceRequest;
import com.examly.springapp.dto.SessionAttendanceResponse;
import com.examly.springapp.model.Session;
import com.examly.springapp.model.SessionAttendance;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.SessionAttendanceRepository;
import com.examly.springapp.repository.SessionRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.SessionAttendanceService;

@Service
public class SessionAttendanceServiceImpl implements SessionAttendanceService {

        private final SessionAttendanceRepository repository;

        private final SessionRepository sessionRepository;

        private final UserRepository userRepository;

        public SessionAttendanceServiceImpl(
                        SessionAttendanceRepository repository,
                        SessionRepository sessionRepository,
                        UserRepository userRepository) {

                this.repository = repository;
                this.sessionRepository = sessionRepository;
                this.userRepository = userRepository;
        }

        // ===================== RECORD ATTENDANCE =====================

        @Override
        public SessionAttendanceResponse recordAttendance(SessionAttendanceRequest request) {

                Session session = sessionRepository.findById(request.getSessionId())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Session not found with id: " + request.getSessionId()));

                User attendee = userRepository.findById(request.getAttendeeId())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found with id: " + request.getAttendeeId()));

                repository.findBySessionIdAndAttendeeId(
                                request.getSessionId(),
                                request.getAttendeeId())
                                .ifPresent(a -> {
                                        throw new ResponseStatusException(
                                                        HttpStatus.BAD_REQUEST,
                                                        "Attendance already recorded");
                                });

                SessionAttendance attendance = new SessionAttendance();

                attendance.setSession(session);

                attendance.setAttendee(attendee);

                applyFields(attendance, request);

                SessionAttendance savedAttendance = repository.save(attendance);

                return toResponse(savedAttendance);
        }

        // ===================== GET ALL =====================

        @Override
        public List<SessionAttendanceResponse> getAllAttendance() {

                return repository.findAll()
                                .stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        // ===================== GET BY ID =====================

        @Override
        public SessionAttendanceResponse getAttendanceById(Long id) {

                SessionAttendance attendance = repository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Attendance record not found with id: " + id));

                return toResponse(attendance);
        }

        // ===================== GET BY SESSION =====================

        @Override
        public List<SessionAttendanceResponse> getAttendanceBySession(Long sessionId) {

                return repository.findBySessionId(sessionId)
                                .stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        // ===================== GET BY ATTENDEE =====================

        @Override
        public List<SessionAttendanceResponse> getAttendanceByAttendee(Long attendeeId) {

                return repository.findByAttendeeId(attendeeId)
                                .stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        // ===================== UPDATE =====================

        @Override
        public SessionAttendanceResponse updateAttendance(
                        Long id,
                        SessionAttendanceRequest request) {

                SessionAttendance attendance = repository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Attendance record not found with id: " + id));

                applyFields(attendance, request);

                SessionAttendance updatedAttendance = repository.save(attendance);

                return toResponse(updatedAttendance);
        }

        // ===================== DELETE =====================

        @Override
        public void deleteAttendance(Long id) {

                SessionAttendance attendance = repository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Attendance record not found with id: " + id));

                repository.delete(attendance);
        }

        // ===================== COMMON FIELD MAPPING =====================

        private void applyFields(
                        SessionAttendance attendance,
                        SessionAttendanceRequest request) {

                attendance.setJoinTime(request.getJoinTime());

                attendance.setLeaveTime(request.getLeaveTime());

                attendance.setDurationMinutes(request.getDurationMinutes());

                attendance.setEngagementScore(request.getEngagementScore());

                if (request.getInteractionsCount() != null) {

                        attendance.setInteractionsCount(request.getInteractionsCount());

                }

                attendance.setDeviceType(request.getDeviceType());
        }

        // ===================== ENTITY TO RESPONSE =====================

        private SessionAttendanceResponse toResponse(SessionAttendance attendance) {

                SessionAttendanceResponse response = new SessionAttendanceResponse();

                response.setId(attendance.getId());

                if (attendance.getSession() != null) {

                        response.setSessionId(attendance.getSession().getId());

                        response.setSessionTitle(attendance.getSession().getTitle());
                }

                if (attendance.getAttendee() != null) {

                        response.setAttendeeId(attendance.getAttendee().getId());

                        response.setAttendeeName(attendance.getAttendee().getUsername());
                }

                response.setJoinTime(attendance.getJoinTime());

                response.setLeaveTime(attendance.getLeaveTime());

                response.setDurationMinutes(attendance.getDurationMinutes());

                response.setEngagementScore(attendance.getEngagementScore());

                response.setInteractionsCount(attendance.getInteractionsCount());

                response.setDeviceType(attendance.getDeviceType());

                return response;
        }
}