package com.examly.springapp.service.Impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.examly.springapp.dto.RegistrationRequest;
import com.examly.springapp.dto.RegistrationResponse;
import com.examly.springapp.model.Event;
import com.examly.springapp.model.Registration;
import com.examly.springapp.model.Role;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.EventRepository;
import com.examly.springapp.repository.RegistrationRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.RegistrationService;

@Service
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository repository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public RegistrationServiceImpl(
            RegistrationRepository repository,
            EventRepository eventRepository,
            UserRepository userRepository) {

        this.repository = repository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Override
    public RegistrationResponse register(
            RegistrationRequest request,
            String loggedInUsername) {

        User attendee = userRepository.findByUsername(loggedInUsername)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Logged-in user not found."));

        if (attendee.getRole() != Role.ATTENDEE) {
            throw new AccessDeniedException(
                    "Only attendees can register for events.");
        }

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Event not found with id: " + request.getEventId()));

        if (repository.existsByEventIdAndAttendeeId(
                event.getId(),
                attendee.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You are already registered for this event.");
        }

        Registration registration = new Registration();

        registration.setEvent(event);
        registration.setAttendee(attendee);
        registration.setRegistrationType(request.getRegistrationType());
        registration.setPaymentStatus(request.getPaymentStatus());
        registration.setPaymentAmount(request.getPaymentAmount());
        registration.setCustomFields(request.getCustomFields());

        registration = repository.save(registration);

        return toResponse(registration);
    }

    @Override
    public List<RegistrationResponse> getAllRegistrations() {

        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RegistrationResponse getRegistrationById(
            Long id,
            String loggedInUsername) {

        Registration registration = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Registration not found."));

        User loggedInUser = userRepository.findByUsername(loggedInUsername)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found."));

        if (loggedInUser.getRole() == Role.ATTENDEE &&
                !registration.getAttendee().getId().equals(loggedInUser.getId())) {

            throw new AccessDeniedException(
                    "You can only view your own registration.");
        }

        return toResponse(registration);
    }

    @Override
    public List<RegistrationResponse> getRegistrationsByEvent(Long eventId) {

        return repository.findByEventId(eventId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RegistrationResponse> getRegistrationsByAttendee(
            Long attendeeId,
            String loggedInUsername) {

        User loggedInUser = userRepository.findByUsername(loggedInUsername)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found."));

        if (loggedInUser.getRole() == Role.ATTENDEE &&
                !loggedInUser.getId().equals(attendeeId)) {

            throw new AccessDeniedException(
                    "You can only view your own registrations.");
        }

        return repository.findByAttendeeId(attendeeId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void cancelRegistration(Long id) {

        Registration registration = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Registration not found."));

        repository.delete(registration);
    }

    private RegistrationResponse toResponse(Registration registration) {

        RegistrationResponse response = new RegistrationResponse();

        response.setId(registration.getId());

        response.setEventId(registration.getEvent().getId());
        response.setEventTitle(registration.getEvent().getTitle());

        response.setAttendeeId(registration.getAttendee().getId());
        response.setAttendeeName(registration.getAttendee().getUsername());

        response.setRegistrationDate(registration.getRegistrationDate());
        response.setRegistrationType(registration.getRegistrationType());
        response.setPaymentStatus(registration.getPaymentStatus());
        response.setPaymentAmount(registration.getPaymentAmount());
        response.setCustomFields(registration.getCustomFields());

        return response;
    }
}