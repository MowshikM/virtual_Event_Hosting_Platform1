package com.examly.springapp.dto;

public class VirtualBoothRequest {

    private Long eventId;
    private Long sponsorId;
    private String boothName;
    private String boothConfig;
    private String brandingConfig;
    private String staffMembers;

    public VirtualBoothRequest() {
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
}