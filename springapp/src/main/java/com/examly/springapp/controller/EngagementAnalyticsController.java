package com.examly.springapp.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.dto.EngagementAnalyticsRequest;
import com.examly.springapp.dto.EngagementAnalyticsResponse;
import com.examly.springapp.service.EngagementAnalyticsService;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class EngagementAnalyticsController {

    private final EngagementAnalyticsService service;

    public EngagementAnalyticsController(EngagementAnalyticsService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EngagementAnalyticsResponse> recordAnalytics(
            @RequestBody EngagementAnalyticsRequest request) {

        EngagementAnalyticsResponse response = service.recordAnalytics(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<EngagementAnalyticsResponse>> getAllAnalytics() {
        return ResponseEntity.ok(service.getAllAnalytics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EngagementAnalyticsResponse> getAnalyticsById(
            @PathVariable Long id) {

        return ResponseEntity.ok(service.getAnalyticsById(id));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<EngagementAnalyticsResponse>> getAnalyticsByEvent(
            @PathVariable Long eventId) {

        return ResponseEntity.ok(service.getAnalyticsByEvent(eventId));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<EngagementAnalyticsResponse>> getAnalyticsBySession(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(service.getAnalyticsBySession(sessionId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<EngagementAnalyticsResponse>> getAnalyticsByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(service.getAnalyticsByUser(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EngagementAnalyticsResponse> updateAnalytics(
            @PathVariable Long id,
            @RequestBody EngagementAnalyticsRequest request) {

        return ResponseEntity.ok(service.updateAnalytics(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnalytics(@PathVariable Long id) {

        service.deleteAnalytics(id);
        return ResponseEntity.noContent().build();
    }
}