package com.examly.springapp.dto;

import java.time.LocalDateTime;

public class VirtualBoothResponse {

    private Long id;
    private Long eventId;
    private Long sponsorId;
    private String boothName;
    private String boothConfig;
    private String brandingConfig;
    private String staffMembers;
    private Integer visitCount;
    private Integer leadCount;
    private LocalDateTime createdDate;

    public VirtualBoothResponse() {
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

    public Long getSponsorId() {
        return sponsorId;
    }

    public void setSponsorId(Long sponsorId) {
        this.sponsorId = sponsorId;
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