package com.examly.springapp.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.examly.springapp.model.Event;
import com.examly.springapp.service.EventService;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    private final EventService service;

    public EventController(EventService service) {
        this.service = service;
    }

    @GetMapping
    public List<Event> getAllEvents() {
        return service.getAllEvents();
    }

    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        return service.createEvent(event);
    }

    @PostMapping("/{id}/rsvp")
    public Event rsvpToEvent(@PathVariable Long id,
                             @RequestParam String attendee) {
        return service.rsvpToEvent(id, attendee);
    }
}