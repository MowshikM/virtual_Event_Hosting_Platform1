package com.examly.springapp.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.dto.SessionAttendanceRequest;
import com.examly.springapp.dto.SessionAttendanceResponse;
import com.examly.springapp.service.SessionAttendanceService;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class SessionAttendanceController {

        private final SessionAttendanceService service;

        public SessionAttendanceController(SessionAttendanceService service) {
                this.service = service;
        }

        // Create Attendance - 201 Created
        @PostMapping
        public ResponseEntity<SessionAttendanceResponse> recordAttendance(
                        @RequestBody SessionAttendanceRequest request) {

                SessionAttendanceResponse response = service.recordAttendance(request);
                return new ResponseEntity<>(response, HttpStatus.CREATED);
        }

        // Get All Attendance - 200 OK
        @GetMapping
        public ResponseEntity<List<SessionAttendanceResponse>> getAllAttendance() {

                return ResponseEntity.ok(service.getAllAttendance());
        }

        // Get Attendance By Id - 200 OK
        @GetMapping("/{id}")
        public ResponseEntity<SessionAttendanceResponse> getAttendanceById(
                        @PathVariable Long id) {

                return ResponseEntity.ok(service.getAttendanceById(id));
        }

        // Get Attendance By Session - 200 OK
        @GetMapping("/session/{sessionId}")
        public ResponseEntity<List<SessionAttendanceResponse>> getAttendanceBySession(
                        @PathVariable Long sessionId) {

                return ResponseEntity.ok(service.getAttendanceBySession(sessionId));
        }

        // Get Attendance By Attendee - 200 OK
        @GetMapping("/attendee/{attendeeId}")
        public ResponseEntity<List<SessionAttendanceResponse>> getAttendanceByAttendee(
                        @PathVariable Long attendeeId) {

                return ResponseEntity.ok(service.getAttendanceByAttendee(attendeeId));
        }

        // Update Attendance - 200 OK
        @PutMapping("/{id}")
        public ResponseEntity<SessionAttendanceResponse> updateAttendance(
                        @PathVariable Long id,
                        @RequestBody SessionAttendanceRequest request) {

                SessionAttendanceResponse response = service.updateAttendance(id, request);
                return ResponseEntity.ok(response);
        }

        // Delete Attendance - 204 No Content
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {

                service.deleteAttendance(id);
                return ResponseEntity.noContent().build();
        }
}