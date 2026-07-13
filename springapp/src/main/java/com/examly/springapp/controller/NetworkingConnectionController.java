package com.examly.springapp.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.dto.NetworkingConnectionRequest;
import com.examly.springapp.dto.NetworkingConnectionResponse;
import com.examly.springapp.service.NetworkingConnectionService;

@RestController
@RequestMapping("/api/connections")
@CrossOrigin(origins = "*")
public class NetworkingConnectionController {

    private final NetworkingConnectionService service;

    public NetworkingConnectionController(NetworkingConnectionService service) {
        this.service = service;
    }

    // Logged-in attendee sends a connection request
    @PostMapping
    public ResponseEntity<NetworkingConnectionResponse> requestConnection(
            @RequestBody NetworkingConnectionRequest request,
            Principal principal) {

        NetworkingConnectionResponse response = service.requestConnection(request, principal.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Admin only
    @GetMapping
    public ResponseEntity<List<NetworkingConnectionResponse>> getAllConnections() {

        return ResponseEntity.ok(service.getAllConnections());
    }

    // Admin or owner (Requester/Recipient)
    @GetMapping("/{id}")
    public ResponseEntity<NetworkingConnectionResponse> getConnectionById(
            @PathVariable Long id,
            Principal principal) {

        return ResponseEntity.ok(
                service.getConnectionById(id, principal.getName()));
    }

    // Logged-in user's own connections
    @GetMapping("/me")
    public ResponseEntity<List<NetworkingConnectionResponse>> getMyConnections(
            Principal principal) {

        return ResponseEntity.ok(
                service.getConnectionsForUser(principal.getName()));
    }

    // Recipient accepts/rejects the request
    @PutMapping("/{id}/respond")
    public ResponseEntity<NetworkingConnectionResponse> respondToConnection(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal) {

        return ResponseEntity.ok(
                service.respondToConnection(
                        id,
                        status,
                        principal.getName()));
    }

    // Requester, Recipient or Admin
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConnection(
            @PathVariable Long id,
            Principal principal) {

        service.deleteConnection(id, principal.getName());

        return ResponseEntity.noContent().build();
    }
}