package com.examly.springapp.service;

import java.util.HashSet;
import java.util.List;

import org.springframework.stereotype.Service;

import com.examly.springapp.model.Event;
import com.examly.springapp.repository.EventRepository;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository repository;

    public EventServiceImpl(EventRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Event> getAllEvents() {
        return repository.findAll();
    }

    @Override
    public Event createEvent(Event event) {

        if (event.getAttendees() == null) {
            event.setAttendees(new HashSet<>());
        }

        return repository.save(event);
    }

    @Override
    public Event rsvpToEvent(Long id, String attendee) {

        Event event = repository.findById(id).orElse(null);

        if (event == null) {
            return null;
        }

        if (event.getAttendees() == null) {
            event.setAttendees(new HashSet<>());
        }

        event.getAttendees().add(attendee);

        return repository.save(event);
    }
}