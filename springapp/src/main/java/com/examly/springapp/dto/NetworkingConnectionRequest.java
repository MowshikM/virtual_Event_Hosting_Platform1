package com.examly.springapp.dto;

import java.time.LocalDateTime;

public class NetworkingConnectionRequest {

    private Long eventId;

    // requesterId removed.
    // Logged-in user (JWT) will be the requester.

    private Long recipientId;

    private String connectionType;

    // Status removed.
    // Backend always creates request with PENDING status.

    private String message;

    private LocalDateTime meetingTime;

    public NetworkingConnectionRequest() {
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public String getConnectionType() {
        return connectionType;
    }

    public void setConnectionType(String connectionType) {
        this.connectionType = connectionType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getMeetingTime() {
        return meetingTime;
    }

    public void setMeetingTime(LocalDateTime meetingTime) {
        this.meetingTime = meetingTime;
    }
}