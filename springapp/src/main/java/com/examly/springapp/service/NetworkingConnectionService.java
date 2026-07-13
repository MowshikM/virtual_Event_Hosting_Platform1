package com.examly.springapp.service;

import java.util.List;

import com.examly.springapp.dto.NetworkingConnectionRequest;
import com.examly.springapp.dto.NetworkingConnectionResponse;

public interface NetworkingConnectionService {

    // Logged-in attendee sends a connection request
    NetworkingConnectionResponse requestConnection(
            NetworkingConnectionRequest request,
            String loggedInUsername);

    // Admin only
    List<NetworkingConnectionResponse> getAllConnections();

    // Admin or owner (Requester/Recipient)
    NetworkingConnectionResponse getConnectionById(
            Long id,
            String loggedInUsername);

    // Logged-in user's connections
    List<NetworkingConnectionResponse> getConnectionsForUser(
            String loggedInUsername);

    // Recipient accepts/rejects the request
    NetworkingConnectionResponse respondToConnection(
            Long id,
            String status,
            String loggedInUsername);

    // Requester, Recipient or Admin
    void deleteConnection(
            Long id,
            String loggedInUsername);
}