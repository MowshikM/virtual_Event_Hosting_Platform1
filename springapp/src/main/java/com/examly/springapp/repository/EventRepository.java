package com.examly.springapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // Get all events created by an organizer
    List<Event> findByOrganizerId(Long organizerId);

    // Search events by title or description
    List<Event> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title,
            String description);

    // Find all events created by organizer username
    List<Event> findByOrganizerUsername(String username);

}