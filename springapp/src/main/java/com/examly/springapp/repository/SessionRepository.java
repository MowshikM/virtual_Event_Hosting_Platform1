package com.examly.springapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.Session;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    // Get all sessions of an event
    List<Session> findByEventId(Long eventId);

    // Get all sessions moderated by a user
    List<Session> findByModeratorId(Long moderatorId);

    // Get all sessions of events created by an organizer
    List<Session> findByEventOrganizerId(Long organizerId);

}