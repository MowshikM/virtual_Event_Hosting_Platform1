package com.examly.springapp.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.dto.SessionRequest;
import com.examly.springapp.dto.SessionResponse;
import com.examly.springapp.service.SessionService;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionController {

        private final SessionService service;

        public SessionController(SessionService service) {
                this.service = service;
        }

        // Create Session
        @PostMapping
        public ResponseEntity<SessionResponse> createSession(
                        @RequestBody SessionRequest request) {

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(service.createSession(request));
        }

        // Get All Sessions
        @GetMapping
        public ResponseEntity<List<SessionResponse>> getAllSessions() {

                return ResponseEntity.ok(
                                service.getAllSessions());
        }

        // Get Session By Id
        @GetMapping("/{id}")
        public ResponseEntity<SessionResponse> getSessionById(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                service.getSessionById(id));
        }

        // Get Sessions By Event
        @GetMapping("/event/{eventId}")
        public ResponseEntity<List<SessionResponse>> getSessionsByEvent(
                        @PathVariable Long eventId) {

                return ResponseEntity.ok(
                                service.getSessionsByEvent(eventId));
        }

        // Update Session
        @PutMapping("/{id}")
        public ResponseEntity<SessionResponse> updateSession(
                        @PathVariable Long id,
                        @RequestBody SessionRequest request) {

                return ResponseEntity.ok(
                                service.updateSession(id, request));
        }

        // Delete Session
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteSession(
                        @PathVariable Long id) {

                service.deleteSession(id);

                return ResponseEntity
                                .noContent()
                                .build();
        }

}