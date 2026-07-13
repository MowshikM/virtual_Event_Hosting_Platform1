package com.examly.springapp.service;

import java.util.List;

import com.examly.springapp.dto.EngagementAnalyticsRequest;
import com.examly.springapp.dto.EngagementAnalyticsResponse;

public interface EngagementAnalyticsService {

    // Create
    EngagementAnalyticsResponse recordAnalytics(EngagementAnalyticsRequest request);

    // Read
    List<EngagementAnalyticsResponse> getAllAnalytics();

    EngagementAnalyticsResponse getAnalyticsById(Long id);

    List<EngagementAnalyticsResponse> getAnalyticsByEvent(Long eventId);

    List<EngagementAnalyticsResponse> getAnalyticsBySession(Long sessionId);

    List<EngagementAnalyticsResponse> getAnalyticsByUser(Long userId);

    // Update
    EngagementAnalyticsResponse updateAnalytics(Long id,
            EngagementAnalyticsRequest request);

    // Delete
    void deleteAnalytics(Long id);
}