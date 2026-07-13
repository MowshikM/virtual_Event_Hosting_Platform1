package com.examly.springapp.dto;

import java.time.LocalDateTime;
import java.util.Set;

public class EventResponse {

    private Long id;

    private String title;

    private String description;

    private LocalDateTime dateTime;

    private String eventLink;

    private Set<String> attendees;

    private Long organizerId;
    private String organizerName;

    public EventResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public String getEventLink() {
        return eventLink;
    }

    public void setEventLink(String eventLink) {
        this.eventLink = eventLink;
    }

    public Set<String> getAttendees() {
        return attendees;
    }

    public void setAttendees(Set<String> attendees) {
        this.attendees = attendees;
    }

    public Long getOrganizerId() {
        return organizerId;
    }

    public void setOrganizerId(Long organizerId) {
        this.organizerId = organizerId;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }
}