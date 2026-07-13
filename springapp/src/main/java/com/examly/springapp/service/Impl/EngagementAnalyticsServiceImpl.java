package com.examly.springapp.service.Impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.examly.springapp.dto.EngagementAnalyticsRequest;
import com.examly.springapp.dto.EngagementAnalyticsResponse;
import com.examly.springapp.model.EngagementAnalytics;
import com.examly.springapp.model.Event;
import com.examly.springapp.model.Session;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.EngagementAnalyticsRepository;
import com.examly.springapp.repository.EventRepository;
import com.examly.springapp.repository.SessionRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.EngagementAnalyticsService;

@Service
public class EngagementAnalyticsServiceImpl implements EngagementAnalyticsService {

    private final EngagementAnalyticsRepository repository;
    private final EventRepository eventRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    public EngagementAnalyticsServiceImpl(
            EngagementAnalyticsRepository repository,
            EventRepository eventRepository,
            SessionRepository sessionRepository,
            UserRepository userRepository) {

        this.repository = repository;
        this.eventRepository = eventRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    @Override
    public EngagementAnalyticsResponse recordAnalytics(EngagementAnalyticsRequest request) {

        EngagementAnalytics analytics = new EngagementAnalytics();

        if (request.getEventId() != null) {
            Event event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new RuntimeException("Event not found with id: " + request.getEventId()));

            analytics.setEvent(event);
        }

        if (request.getSessionId() != null) {
            Session session = sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new RuntimeException("Session not found with id: " + request.getSessionId()));

            analytics.setSession(session);
        }

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

            analytics.setUser(user);
        }

        analytics.setEngagementType(request.getEngagementType());
        analytics.setEngagementData(request.getEngagementData());
        analytics.setDurationSeconds(request.getDurationSeconds());

        EngagementAnalytics savedAnalytics = repository.save(analytics);

        return toResponse(savedAnalytics);
    }

    @Override
    public List<EngagementAnalyticsResponse> getAllAnalytics() {

        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public EngagementAnalyticsResponse getAnalyticsById(Long id) {

        EngagementAnalytics analytics = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Analytics not found with id: " + id));

        return toResponse(analytics);
    }

    @Override
    public List<EngagementAnalyticsResponse> getAnalyticsByEvent(Long eventId) {

        return repository.findByEventId(eventId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<EngagementAnalyticsResponse> getAnalyticsBySession(Long sessionId) {

        return repository.findBySessionId(sessionId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<EngagementAnalyticsResponse> getAnalyticsByUser(Long userId) {

        return repository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public EngagementAnalyticsResponse updateAnalytics(
            Long id,
            EngagementAnalyticsRequest request) {

        EngagementAnalytics analytics = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Analytics not found with id: " + id));

        if (request.getEventId() != null) {
            Event event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new RuntimeException("Event not found with id: " + request.getEventId()));

            analytics.setEvent(event);
        }

        if (request.getSessionId() != null) {
            Session session = sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new RuntimeException("Session not found with id: " + request.getSessionId()));

            analytics.setSession(session);
        }

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

            analytics.setUser(user);
        }

        analytics.setEngagementType(request.getEngagementType());
        analytics.setEngagementData(request.getEngagementData());
        analytics.setDurationSeconds(request.getDurationSeconds());

        EngagementAnalytics updatedAnalytics = repository.save(analytics);

        return toResponse(updatedAnalytics);
    }

    @Override
    public void deleteAnalytics(Long id) {

        EngagementAnalytics analytics = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Analytics not found with id: " + id));

        repository.delete(analytics);
    }

    private EngagementAnalyticsResponse toResponse(EngagementAnalytics analytics) {

        EngagementAnalyticsResponse response = new EngagementAnalyticsResponse();

        response.setId(analytics.getId());

        response.setEventId(
                analytics.getEvent() != null
                        ? analytics.getEvent().getId()
                        : null);

        response.setSessionId(
                analytics.getSession() != null
                        ? analytics.getSession().getId()
                        : null);

        response.setUserId(
                analytics.getUser() != null
                        ? analytics.getUser().getId()
                        : null);

        response.setEngagementType(analytics.getEngagementType());
        response.setEngagementData(analytics.getEngagementData());
        response.setTimestamp(analytics.getTimestamp());
        response.setDurationSeconds(analytics.getDurationSeconds());

        return response;
    }
}