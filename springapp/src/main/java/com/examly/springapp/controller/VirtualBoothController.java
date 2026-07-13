package com.examly.springapp.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.dto.VirtualBoothRequest;
import com.examly.springapp.dto.VirtualBoothResponse;
import com.examly.springapp.service.VirtualBoothService;

@RestController
@RequestMapping("/api/booths")
@CrossOrigin(origins = "*")
public class VirtualBoothController {

    private final VirtualBoothService service;

    public VirtualBoothController(VirtualBoothService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<VirtualBoothResponse> createBooth(
            @RequestBody VirtualBoothRequest request) {

        VirtualBoothResponse response = service.createBooth(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<VirtualBoothResponse>> getAllBooths() {

        List<VirtualBoothResponse> response = service.getAllBooths();

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VirtualBoothResponse> getBoothById(
            @PathVariable Long id) {

        VirtualBoothResponse response = service.getBoothById(id);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<VirtualBoothResponse>> getBoothsByEvent(
            @PathVariable Long eventId) {

        List<VirtualBoothResponse> response = service.getBoothsByEvent(eventId);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VirtualBoothResponse> updateBooth(
            @PathVariable Long id,
            @RequestBody VirtualBoothRequest request) {

        VirtualBoothResponse response = service.updateBooth(id, request);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/{id}/visit")
    public ResponseEntity<VirtualBoothResponse> recordVisit(
            @PathVariable Long id) {

        VirtualBoothResponse response = service.recordVisit(id);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/{id}/lead")
    public ResponseEntity<VirtualBoothResponse> recordLead(
            @PathVariable Long id) {

        VirtualBoothResponse response = service.recordLead(id);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<VirtualBoothResponse> deleteBooth(
            @PathVariable Long id) {

        VirtualBoothResponse response = service.deleteBooth(id);

        return new ResponseEntity<>(response, HttpStatus.NO_CONTENT);
    }
}