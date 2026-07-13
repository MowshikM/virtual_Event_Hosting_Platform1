package com.examly.springapp.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.dto.LiveInteractionRequest;
import com.examly.springapp.dto.LiveInteractionResponse;
import com.examly.springapp.service.LiveInteractionService;

@RestController
@RequestMapping("/api/interactions")
@CrossOrigin(origins = "*")
public class LiveInteractionController {

    private final LiveInteractionService service;

    public LiveInteractionController(
            LiveInteractionService service) {

        this.service = service;
    }

    // ATTENDEE / ORGANIZER / ADMIN
    @PostMapping
    public ResponseEntity<LiveInteractionResponse> createInteraction(
            @RequestBody LiveInteractionRequest request,
            Principal principal) {

        LiveInteractionResponse response = service.createInteraction(
                request,
                principal.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Everyone
    @GetMapping
    public ResponseEntity<List<LiveInteractionResponse>> getAllInteractions() {

        return ResponseEntity.ok(service.getAllInteractions());
    }

    // Everyone
    @GetMapping("/{id}")
    public ResponseEntity<LiveInteractionResponse> getInteractionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.getInteractionById(id));
    }

    // Everyone
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<LiveInteractionResponse>> getInteractionsBySession(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                service.getInteractionsBySession(sessionId));
    }

    // ADMIN / ORGANIZER
    @PutMapping("/{id}/moderate")
    public ResponseEntity<LiveInteractionResponse> moderateInteraction(
            @PathVariable Long id,
            @RequestParam boolean approved) {

        return ResponseEntity.ok(
                service.moderateInteraction(id, approved));
    }

    // ADMIN
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInteraction(
            @PathVariable Long id) {

        service.deleteInteraction(id);

        return ResponseEntity.noContent().build();
    }
}