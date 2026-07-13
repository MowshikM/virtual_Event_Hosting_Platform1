package com.examly.springapp.dto;

import java.time.LocalDateTime;

public class SessionRequest {

    private Long eventId;

    private String title;

    private String description;

    private String sessionType;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String speakerIds;

    private String streamingConfig;

    private Boolean isRecorded;

    private String recordingUrl;

    private String status;

    public SessionRequest() {
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSessionType() {
        return sessionType;
    }

    public void setSessionType(String sessionType) {
        this.sessionType = sessionType;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getSpeakerIds() {
        return speakerIds;
    }

    public void setSpeakerIds(String speakerIds) {
        this.speakerIds = speakerIds;
    }

    public String getStreamingConfig() {
        return streamingConfig;
    }

    public void setStreamingConfig(String streamingConfig) {
        this.streamingConfig = streamingConfig;
    }

    public Boolean getIsRecorded() {
        return isRecorded;
    }

    public void setIsRecorded(Boolean isRecorded) {
        this.isRecorded = isRecorded;
    }

    public String getRecordingUrl() {
        return recordingUrl;
    }

    public void setRecordingUrl(String recordingUrl) {
        this.recordingUrl = recordingUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}