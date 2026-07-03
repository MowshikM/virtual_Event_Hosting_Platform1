package com.examly.springapp.service;

import java.util.List;

import com.examly.springapp.model.Event;

public interface EventService {

    List<Event> getAllEvents();

    Event createEvent(Event event);

    Event rsvpToEvent(Long id, String attendee);

}