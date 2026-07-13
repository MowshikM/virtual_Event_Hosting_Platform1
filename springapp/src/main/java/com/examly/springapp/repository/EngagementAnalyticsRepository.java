package com.examly.springapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.EngagementAnalytics;

@Repository
public interface EngagementAnalyticsRepository extends JpaRepository<EngagementAnalytics, Long> {

    List<EngagementAnalytics> findByEventId(Long eventId);

    List<EngagementAnalytics> findBySessionId(Long sessionId);

    List<EngagementAnalytics> findByUserId(Long userId);
}