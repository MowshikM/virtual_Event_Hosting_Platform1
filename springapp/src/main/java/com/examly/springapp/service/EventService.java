package com.examly.springapp.service;

import java.util.List;

import com.examly.springapp.dto.EventRequest;
import com.examly.springapp.dto.EventResponse;

public interface EventService {

    // Get all events
    List<EventResponse> getAllEvents();

    // Get event by ID
    EventResponse getEventById(Long id);

    // Create a new event
    EventResponse createEvent(EventRequest request);

    // Update an existing event
    EventResponse updateEvent(Long id, EventRequest request);

    // Delete an event
    void deleteEvent(Long id);

    // RSVP to an event
    EventResponse rsvpToEvent(Long id, String attendee);

    // Search events
    List<EventResponse> searchEvents(String keyword);

}