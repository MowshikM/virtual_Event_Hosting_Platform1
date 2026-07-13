package com.examly.springapp.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.dto.EventRequest;
import com.examly.springapp.dto.EventResponse;
import com.examly.springapp.service.EventService;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

        private final EventService service;

        public EventController(EventService service) {
                this.service = service;
        }

        // Create Event
        @PostMapping
        public ResponseEntity<EventResponse> createEvent(
                        @RequestBody EventRequest request) {

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(service.createEvent(request));
        }

        // Get All Events
        @GetMapping
        public ResponseEntity<List<EventResponse>> getAllEvents() {

                return ResponseEntity.ok(
                                service.getAllEvents());
        }

        // Get Event By ID
        @GetMapping("/{id}")
        public ResponseEntity<EventResponse> getEventById(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                service.getEventById(id));
        }

        // Update Event
        @PutMapping("/{id}")
        public ResponseEntity<EventResponse> updateEvent(
                        @PathVariable Long id,
                        @RequestBody EventRequest request) {

                return ResponseEntity.ok(
                                service.updateEvent(id, request));
        }

        // Delete Event
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteEvent(
                        @PathVariable Long id) {

                service.deleteEvent(id);

                return ResponseEntity
                                .noContent()
                                .build();
        }

        // RSVP to Event
        @PostMapping("/{id}/rsvp")
        public ResponseEntity<EventResponse> rsvpToEvent(
                        @PathVariable Long id,
                        @RequestParam String attendee) {

                return ResponseEntity.ok(
                                service.rsvpToEvent(id, attendee));
        }

        // Search Events
        @GetMapping("/search")
        public ResponseEntity<List<EventResponse>> searchEvents(
                        @RequestParam String keyword) {

                return ResponseEntity.ok(
                                service.searchEvents(keyword));
        }

}