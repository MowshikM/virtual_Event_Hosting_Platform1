package com.examly.springapp.service;

import java.util.List;

import com.examly.springapp.dto.RegistrationRequest;
import com.examly.springapp.dto.RegistrationResponse;

public interface RegistrationService {

    // ATTENDEE registers for an event
    RegistrationResponse register(
            RegistrationRequest request,
            String loggedInUsername);

    // ADMIN / ORGANIZER
    List<RegistrationResponse> getAllRegistrations();

    // ADMIN / ORGANIZER or Owner
    RegistrationResponse getRegistrationById(
            Long id,
            String loggedInUsername);

    // ADMIN / ORGANIZER
    List<RegistrationResponse> getRegistrationsByEvent(Long eventId);

    // ADMIN / ORGANIZER or Owner
    List<RegistrationResponse> getRegistrationsByAttendee(
            Long attendeeId,
            String loggedInUsername);

    // ADMIN
    void cancelRegistration(Long id);
}