package com.examly.springapp.service.Impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.examly.springapp.dto.NetworkingConnectionRequest;
import com.examly.springapp.dto.NetworkingConnectionResponse;
import com.examly.springapp.model.Event;
import com.examly.springapp.model.NetworkingConnection;
import com.examly.springapp.model.Role;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.EventRepository;
import com.examly.springapp.repository.NetworkingConnectionRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.NetworkingConnectionService;

@Service
public class NetworkingConnectionServiceImpl implements NetworkingConnectionService {

        private final NetworkingConnectionRepository repository;
        private final EventRepository eventRepository;
        private final UserRepository userRepository;

        public NetworkingConnectionServiceImpl(
                        NetworkingConnectionRepository repository,
                        EventRepository eventRepository,
                        UserRepository userRepository) {

                this.repository = repository;
                this.eventRepository = eventRepository;
                this.userRepository = userRepository;
        }

        @Override
        public NetworkingConnectionResponse requestConnection(
                        NetworkingConnectionRequest request,
                        String loggedInUsername) {

                User requester = userRepository.findByUsername(loggedInUsername)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Logged in user not found."));

                if (requester.getRole() != Role.ATTENDEE
                                && requester.getRole() != Role.ADMIN) {

                        throw new AccessDeniedException(
                                        "Only attendees can send networking requests.");
                }

                System.out.println("===== NETWORK REQUEST =====");
                System.out.println("Logged In User : " + loggedInUsername);
                System.out.println("Event ID       : " + request.getEventId());
                System.out.println("Recipient ID   : " + request.getRecipientId());
                System.out.println("ConnectionType : " + request.getConnectionType());
                System.out.println("Message        : " + request.getMessage());
                System.out.println("Meeting Time   : " + request.getMeetingTime());
                System.out.println("===========================");
                Event event = eventRepository.findById(request.getEventId())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Event not found with id: " + request.getEventId()));

                User recipient = userRepository.findById(request.getRecipientId())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Recipient not found with id: " + request.getRecipientId()));

                if (requester.getId().equals(recipient.getId())) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "You cannot send a connection request to yourself.");
                }

                boolean exists = repository
                                .existsByRequesterIdAndRecipientIdOrRequesterIdAndRecipientId(
                                                requester.getId(),
                                                recipient.getId(),
                                                recipient.getId(),
                                                requester.getId());

                if (exists) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "A connection already exists between these users.");
                }

                NetworkingConnection connection = new NetworkingConnection();

                connection.setEvent(event);
                connection.setRequester(requester);
                connection.setRecipient(recipient);
                connection.setConnectionType(request.getConnectionType());

                // Every new request starts as PENDING
                connection.setStatus("PENDING");

                connection.setMessage(request.getMessage());
                connection.setMeetingTime(request.getMeetingTime());

                return toResponse(repository.save(connection));
        }

        @Override
        public List<NetworkingConnectionResponse> getAllConnections() {

                return repository.findAll()
                                .stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public NetworkingConnectionResponse getConnectionById(
                        Long id,
                        String loggedInUsername) {

                NetworkingConnection connection = repository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Networking Connection not found with id: " + id));

                User loggedInUser = userRepository.findByUsername(loggedInUsername)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found."));

                // Admin can view any connection
                if (loggedInUser.getRole() != Role.ADMIN) {

                        boolean isRequester = connection.getRequester().getId().equals(loggedInUser.getId());

                        boolean isRecipient = connection.getRecipient().getId().equals(loggedInUser.getId());

                        if (!isRequester && !isRecipient) {
                                throw new AccessDeniedException(
                                                "You can only view your own networking connections.");
                        }
                }

                return toResponse(connection);
        }

        @Override
        public List<NetworkingConnectionResponse> getConnectionsForUser(
                        String loggedInUsername) {

                User loggedInUser = userRepository.findByUsername(loggedInUsername)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found."));

                if (loggedInUser.getRole() == Role.ADMIN) {

                        return repository.findAll()
                                        .stream()
                                        .map(this::toResponse)
                                        .collect(Collectors.toList());
                }

                return repository.findByRequesterIdOrRecipientId(
                                loggedInUser.getId(),
                                loggedInUser.getId())
                                .stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public NetworkingConnectionResponse respondToConnection(
                        Long id,
                        String status,
                        String loggedInUsername) {

                NetworkingConnection connection = repository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Networking Connection not found with id: " + id));

                User loggedInUser = userRepository.findByUsername(loggedInUsername)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found."));

                // Only recipient can accept/reject
                if (!connection.getRecipient().getId().equals(loggedInUser.getId())) {
                        throw new AccessDeniedException(
                                        "Only the recipient can respond to this connection request.");
                }

                if (!status.equalsIgnoreCase("ACCEPTED")
                                && !status.equalsIgnoreCase("REJECTED")) {

                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Status must be ACCEPTED or REJECTED.");
                }

                status = status.trim().toUpperCase();

                connection.setStatus(status);

                return toResponse(repository.save(connection));
        }

        @Override
        public void deleteConnection(
                        Long id,
                        String loggedInUsername) {

                NetworkingConnection connection = repository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Networking Connection not found with id: " + id));

                User loggedInUser = userRepository.findByUsername(loggedInUsername)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found."));

                boolean isAdmin = loggedInUser.getRole() == Role.ADMIN;

                boolean isRequester = connection.getRequester().getId().equals(loggedInUser.getId());

                boolean isRecipient = connection.getRecipient().getId().equals(loggedInUser.getId());

                if (!isAdmin && !isRequester && !isRecipient) {
                        throw new AccessDeniedException(
                                        "You are not authorized to delete this connection.");
                }

                repository.delete(connection);
        }

        private NetworkingConnectionResponse toResponse(
                        NetworkingConnection connection) {

                NetworkingConnectionResponse response = new NetworkingConnectionResponse();

                response.setId(connection.getId());

                response.setEventId(
                                connection.getEvent() != null
                                                ? connection.getEvent().getId()
                                                : null);

                response.setEventTitle(
                                connection.getEvent() != null
                                                ? connection.getEvent().getTitle()
                                                : null);

                response.setRequesterId(
                                connection.getRequester() != null
                                                ? connection.getRequester().getId()
                                                : null);

                response.setRequesterName(
                                connection.getRequester() != null
                                                ? connection.getRequester().getUsername()
                                                : null);

                response.setRecipientId(
                                connection.getRecipient() != null
                                                ? connection.getRecipient().getId()
                                                : null);

                response.setRecipientName(
                                connection.getRecipient() != null
                                                ? connection.getRecipient().getUsername()
                                                : null);

                response.setConnectionType(connection.getConnectionType());
                response.setStatus(connection.getStatus());
                response.setMessage(connection.getMessage());
                response.setMeetingTime(connection.getMeetingTime());
                response.setCreatedDate(connection.getCreatedDate());

                return response;
        }
}