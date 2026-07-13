package com.examly.springapp.service.Impl;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.examly.springapp.dto.EventRequest;
import com.examly.springapp.dto.EventResponse;
import com.examly.springapp.model.Event;
import com.examly.springapp.model.Role;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.EventRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.EventService;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    private final UserRepository userRepository;

    public EventServiceImpl(
            EventRepository eventRepository,
            UserRepository userRepository) {

        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<EventResponse> getAllEvents() {

        return eventRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

    }

    @Override
    public EventResponse getEventById(Long id) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Event not found with id: " + id));

        return toResponse(event);

    }

    @Override
    public List<EventResponse> searchEvents(String keyword) {

        return eventRepository
                .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                        keyword,
                        keyword)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

    }

    @Override
    public EventResponse createEvent(EventRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        System.out.println("====================================");
        System.out.println("Authentication = " + authentication);

        String username = authentication.getName();

        System.out.println("Logged Username = " + username);

        User organizer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Organizer not found"));

        System.out.println("Organizer ID = " + organizer.getId());
        System.out.println("Organizer Username = " + organizer.getUsername());

        Event event = new Event();

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setDateTime(request.getDateTime());
        event.setEventLink(request.getEventLink());

        event.setOrganizer(organizer);

        System.out.println("Event Organizer Before Save = " + event.getOrganizer().getUsername());

        if (request.getAttendees() == null) {
            event.setAttendees(new HashSet<>());
        } else {
            event.setAttendees(request.getAttendees());
        }

        Event savedEvent = eventRepository.save(event);

        System.out.println("Saved Event Organizer = "
                + (savedEvent.getOrganizer() == null
                        ? "NULL"
                        : savedEvent.getOrganizer().getUsername()));

        System.out.println("====================================");

        return toResponse(savedEvent);
    }

    @Override
    public EventResponse updateEvent(Long id, EventRequest request) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Event not found with id: " + id));

        User currentUser = getCurrentUser();

        // Only Admin or Event Organizer can update
        if (currentUser.getRole() != Role.ADMIN &&
                !event.getOrganizer().getId().equals(currentUser.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to update this event");
        }

        event.setTitle(request.getTitle());

        event.setDescription(request.getDescription());

        event.setDateTime(request.getDateTime());

        event.setEventLink(request.getEventLink());

        Event updatedEvent = eventRepository.save(event);

        return toResponse(updatedEvent);

    }

    @Override
    public void deleteEvent(Long id) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Event not found with id: " + id));

        User currentUser = getCurrentUser();

        // Only Admin or Event Organizer can delete
        if (currentUser.getRole() != Role.ADMIN &&
                !event.getOrganizer().getId().equals(currentUser.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to delete this event");
        }

        eventRepository.delete(event);

    }

    @Override
    public EventResponse rsvpToEvent(Long id, String attendee) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Event not found with id: " + id));

        if (event.getAttendees() == null) {

            event.setAttendees(new HashSet<>());

        }

        event.getAttendees().add(attendee);

        Event updatedEvent = eventRepository.save(event);

        return toResponse(updatedEvent);

    }

    private EventResponse toResponse(Event event) {

        EventResponse response = new EventResponse();

        response.setId(event.getId());

        response.setTitle(event.getTitle());

        response.setDescription(event.getDescription());

        response.setDateTime(event.getDateTime());

        response.setEventLink(event.getEventLink());

        response.setAttendees(event.getAttendees());

        if (event.getOrganizer() != null) {

            response.setOrganizerId(event.getOrganizer().getId());

            response.setOrganizerName(event.getOrganizer().getUsername());

        }

        return response;

    }

    private User getCurrentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));

    }

}