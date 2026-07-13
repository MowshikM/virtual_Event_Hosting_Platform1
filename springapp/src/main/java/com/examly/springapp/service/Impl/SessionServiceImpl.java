package com.examly.springapp.service.Impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.examly.springapp.dto.SessionRequest;
import com.examly.springapp.dto.SessionResponse;
import com.examly.springapp.model.Event;
import com.examly.springapp.model.Role;
import com.examly.springapp.model.Session;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.EventRepository;
import com.examly.springapp.repository.SessionRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.SessionService;

@Service
public class SessionServiceImpl implements SessionService {

        private final SessionRepository sessionRepository;

        private final EventRepository eventRepository;

        private final UserRepository userRepository;

        public SessionServiceImpl(
                        SessionRepository sessionRepository,
                        EventRepository eventRepository,
                        UserRepository userRepository) {

                this.sessionRepository = sessionRepository;
                this.eventRepository = eventRepository;
                this.userRepository = userRepository;
        }

        // ===================== GET ALL SESSIONS =====================

        @Override
        public List<SessionResponse> getAllSessions() {

                return sessionRepository.findAll()
                                .stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        // ===================== GET SESSION BY ID =====================

        @Override
        public SessionResponse getSessionById(Long id) {

                Session session = sessionRepository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Session not found with id: " + id));

                return toResponse(session);
        }

        // ===================== GET SESSIONS BY EVENT =====================

        @Override
        public List<SessionResponse> getSessionsByEvent(Long eventId) {

                return sessionRepository.findByEventId(eventId)
                                .stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }
        // ===================== CREATE SESSION =====================

        @Override
        public SessionResponse createSession(SessionRequest request) {

                Event event = eventRepository.findById(request.getEventId())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Event not found with id: " + request.getEventId()));

                User currentUser = getCurrentUser();

                // Only Admin or Event Organizer can create sessions
                if (currentUser.getRole() != Role.ADMIN
                                && !event.getOrganizer().getId().equals(currentUser.getId())) {

                        throw new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "You are not allowed to create a session for this event");
                }

                Session session = new Session();

                session.setEvent(event);

                applyFields(session, request);

                Session savedSession = sessionRepository.save(session);

                return toResponse(savedSession);
        }

        // ===================== UPDATE SESSION =====================

        @Override
        public SessionResponse updateSession(
                        Long id,
                        SessionRequest request) {

                Session session = sessionRepository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Session not found with id: " + id));

                User currentUser = getCurrentUser();

                // Only Admin or Event Organizer can update
                if (currentUser.getRole() != Role.ADMIN
                                && !session.getEvent().getOrganizer().getId().equals(currentUser.getId())) {

                        throw new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "You are not allowed to update this session");
                }

                applyFields(session, request);

                Session updatedSession = sessionRepository.save(session);

                return toResponse(updatedSession);
        }
        // ===================== DELETE SESSION =====================

        @Override
        public void deleteSession(Long id) {

                Session session = sessionRepository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Session not found with id: " + id));

                User currentUser = getCurrentUser();

                // Only Admin or Event Organizer can delete
                if (currentUser.getRole() != Role.ADMIN
                                && !session.getEvent().getOrganizer().getId().equals(currentUser.getId())) {

                        throw new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "You are not allowed to delete this session");
                }

                sessionRepository.delete(session);
        }

        // ===================== COMMON FIELD MAPPING =====================

        private void applyFields(
                        Session session,
                        SessionRequest request) {

                session.setTitle(request.getTitle());

                session.setDescription(request.getDescription());

                session.setSessionType(request.getSessionType());

                session.setStartTime(request.getStartTime());

                session.setEndTime(request.getEndTime());

                session.setSpeakerIds(request.getSpeakerIds());

                session.setStreamingConfig(request.getStreamingConfig());

                if (request.getIsRecorded() != null) {
                        session.setIsRecorded(request.getIsRecorded());
                }

                session.setRecordingUrl(request.getRecordingUrl());

                session.setStatus(request.getStatus());
        }
        // ===================== ENTITY TO RESPONSE =====================

        private SessionResponse toResponse(Session session) {

                SessionResponse response = new SessionResponse();

                response.setId(session.getId());

                if (session.getEvent() != null) {

                        response.setEventId(session.getEvent().getId());

                        response.setEventTitle(session.getEvent().getTitle());
                }

                if (session.getModerator() != null) {

                        response.setModeratorId(session.getModerator().getId());

                        response.setModeratorName(session.getModerator().getUsername());
                }

                response.setTitle(session.getTitle());

                response.setDescription(session.getDescription());

                response.setSessionType(session.getSessionType());

                response.setStartTime(session.getStartTime());

                response.setEndTime(session.getEndTime());

                response.setSpeakerIds(session.getSpeakerIds());

                response.setStreamingConfig(session.getStreamingConfig());

                response.setIsRecorded(session.getIsRecorded());

                response.setRecordingUrl(session.getRecordingUrl());

                response.setStatus(session.getStatus());

                return response;
        }
        // ===================== GET CURRENT LOGGED-IN USER =====================

        private User getCurrentUser() {

                Authentication authentication = SecurityContextHolder
                                .getContext()
                                .getAuthentication();

                String username = authentication.getName();

                return userRepository.findByUsername(username)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found"));
        }
}
