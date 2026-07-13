package com.examly.springapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.Registration;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    List<Registration> findByEventId(Long eventId);

    List<Registration> findByAttendeeId(Long attendeeId);

    Optional<Registration> findByEventIdAndAttendeeId(Long eventId, Long attendeeId);

    boolean existsByEventIdAndAttendeeId(Long eventId, Long attendeeId);
}