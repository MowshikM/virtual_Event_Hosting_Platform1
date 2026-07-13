package com.examly.springapp.model;

import java.io.Serializable;
import java.time.LocalDateTime;

import javax.persistence.*;

@Entity
@Table(name = "session")
public class Session implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderator_id")
    private User moderator;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "session_type")
    private String sessionType;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "speaker_ids", columnDefinition = "TEXT")
    private String speakerIds;

    @Column(name = "streaming_config", columnDefinition = "TEXT")
    private String streamingConfig;

    @Column(name = "is_recorded")
    private Boolean isRecorded = false;

    @Column(name = "recording_url")
    private String recordingUrl;

    private String status;

    public Session() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public User getModerator() {
        return moderator;
    }

    public void setModerator(User moderator) {
        this.moderator = moderator;
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