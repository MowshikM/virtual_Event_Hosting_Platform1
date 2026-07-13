package com.examly.springapp.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.dto.RegistrationRequest;
import com.examly.springapp.dto.RegistrationResponse;
import com.examly.springapp.service.RegistrationService;

@RestController
@RequestMapping("/api/registrations")
@CrossOrigin(origins = "*")
public class RegistrationController {

    private final RegistrationService service;

    public RegistrationController(RegistrationService service) {
        this.service = service;
    }

    // ATTENDEE registers for an event
    @PostMapping
    public ResponseEntity<RegistrationResponse> register(
            @RequestBody RegistrationRequest request,
            Principal principal) {

        RegistrationResponse response = service.register(request, principal.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ADMIN / ORGANIZER
    @GetMapping
    public ResponseEntity<List<RegistrationResponse>> getAllRegistrations() {

        return ResponseEntity.ok(service.getAllRegistrations());
    }

    // ADMIN / ORGANIZER or owner
    @GetMapping("/{id}")
    public ResponseEntity<RegistrationResponse> getRegistrationById(
            @PathVariable Long id,
            Principal principal) {

        return ResponseEntity.ok(
                service.getRegistrationById(id, principal.getName()));
    }

    // ADMIN / ORGANIZER
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<RegistrationResponse>> getRegistrationsByEvent(
            @PathVariable Long eventId) {

        return ResponseEntity.ok(
                service.getRegistrationsByEvent(eventId));
    }

    // ADMIN / ORGANIZER or owner
    @GetMapping("/attendee/{attendeeId}")
    public ResponseEntity<List<RegistrationResponse>> getRegistrationsByAttendee(
            @PathVariable Long attendeeId,
            Principal principal) {

        return ResponseEntity.ok(
                service.getRegistrationsByAttendee(
                        attendeeId,
                        principal.getName()));
    }

    // ADMIN
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelRegistration(
            @PathVariable Long id) {

        service.cancelRegistration(id);

        return ResponseEntity.noContent().build();
    }
}