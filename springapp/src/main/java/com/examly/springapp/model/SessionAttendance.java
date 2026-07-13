package com.examly.springapp.model;

import java.io.Serializable;
import java.time.LocalDateTime;

import javax.persistence.*;

@Entity
@Table(name = "session_attendance")
public class SessionAttendance implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendee_id", nullable = false)
    private User attendee;

    @Column(name = "join_time")
    private LocalDateTime joinTime;

    @Column(name = "leave_time")
    private LocalDateTime leaveTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "engagement_score")
    private Double engagementScore;

    @Column(name = "interactions_count")
    private Integer interactionsCount = 0;

    @Column(name = "device_type")
    private String deviceType;

    public SessionAttendance() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public User getAttendee() {
        return attendee;
    }

    public void setAttendee(User attendee) {
        this.attendee = attendee;
    }

    public LocalDateTime getJoinTime() {
        return joinTime;
    }

    public void setJoinTime(LocalDateTime joinTime) {
        this.joinTime = joinTime;
    }

    public LocalDateTime getLeaveTime() {
        return leaveTime;
    }

    public void setLeaveTime(LocalDateTime leaveTime) {
        this.leaveTime = leaveTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Double getEngagementScore() {
        return engagementScore;
    }

    public void setEngagementScore(Double engagementScore) {
        this.engagementScore = engagementScore;
    }

    public Integer getInteractionsCount() {
        return interactionsCount;
    }

    public void setInteractionsCount(Integer interactionsCount) {
        this.interactionsCount = interactionsCount;
    }

    public String getDeviceType() {
        return deviceType;
    }

    public void setDeviceType(String deviceType) {
        this.deviceType = deviceType;
    }
}