package com.examly.springapp.service;

import java.util.List;

import com.examly.springapp.dto.SessionRequest;
import com.examly.springapp.dto.SessionResponse;

public interface SessionService {

    SessionResponse createSession(SessionRequest request);

    List<SessionResponse> getAllSessions();

    SessionResponse getSessionById(Long id);

    List<SessionResponse> getSessionsByEvent(Long eventId);

    SessionResponse updateSession(Long id, SessionRequest request);

    void deleteSession(Long id);
}