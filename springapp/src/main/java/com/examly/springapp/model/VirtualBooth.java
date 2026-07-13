package com.examly.springapp.model;

import java.io.Serializable;
import java.time.LocalDateTime;

import javax.persistence.*;

@Entity
@Table(name = "virtual_booth")
public class VirtualBooth implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sponsor_id", nullable = false)
    private User sponsor;

    @Column(name = "booth_name")
    private String boothName;

    @Column(name = "booth_config", columnDefinition = "TEXT")
    private String boothConfig;

    @Column(name = "branding_config", columnDefinition = "TEXT")
    private String brandingConfig;

    // Comma-separated list of staff User ids
    @Column(name = "staff_members", columnDefinition = "TEXT")
    private String staffMembers;

    @Column(name = "visit_count")
    private Integer visitCount = 0;

    @Column(name = "lead_count")
    private Integer leadCount = 0;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    public VirtualBooth() {
    }

    @PrePersist
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
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

    public User getSponsor() {
        return sponsor;
    }

    public void setSponsor(User sponsor) {
        this.sponsor = sponsor;
    }

    public String getBoothName() {
        return boothName;
    }

    public void setBoothName(String boothName) {
        this.boothName = boothName;
    }

    public String getBoothConfig() {
        return boothConfig;
    }

    public void setBoothConfig(String boothConfig) {
        this.boothConfig = boothConfig;
    }

    public String getBrandingConfig() {
        return brandingConfig;
    }

    public void setBrandingConfig(String brandingConfig) {
        this.brandingConfig = brandingConfig;
    }

    public String getStaffMembers() {
        return staffMembers;
    }

    public void setStaffMembers(String staffMembers) {
        this.staffMembers = staffMembers;
    }

    public Integer getVisitCount() {
        return visitCount;
    }

    public void setVisitCount(Integer visitCount) {
        this.visitCount = visitCount;
    }

    public Integer getLeadCount() {
        return leadCount;
    }

    public void setLeadCount(Integer leadCount) {
        this.leadCount = leadCount;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
}