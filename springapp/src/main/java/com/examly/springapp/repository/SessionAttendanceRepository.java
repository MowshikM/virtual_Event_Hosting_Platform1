package com.examly.springapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.SessionAttendance;

@Repository
public interface SessionAttendanceRepository extends JpaRepository<SessionAttendance, Long> {

    List<SessionAttendance> findBySessionId(Long sessionId);

    List<SessionAttendance> findByAttendeeId(Long attendeeId);

    Optional<SessionAttendance> findBySessionIdAndAttendeeId(Long sessionId, Long attendeeId);
}