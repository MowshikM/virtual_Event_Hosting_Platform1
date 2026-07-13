package com.examly.springapp.dto;

import java.time.LocalDateTime;

public class EngagementAnalyticsResponse {

    private Long id;
    private Long eventId;
    private Long sessionId;
    private Long userId;
    private String engagementType;
    private String engagementData;
    private LocalDateTime timestamp;
    private Integer durationSeconds;

    public EngagementAnalyticsResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEngagementType() {
        return engagementType;
    }

    public void setEngagementType(String engagementType) {
        this.engagementType = engagementType;
    }

    public String getEngagementData() {
        return engagementData;
    }

    public void setEngagementData(String engagementData) {
        this.engagementData = engagementData;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }
}