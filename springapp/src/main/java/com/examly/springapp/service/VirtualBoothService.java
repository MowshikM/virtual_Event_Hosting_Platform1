package com.examly.springapp.service;

import java.util.List;

import com.examly.springapp.dto.VirtualBoothRequest;
import com.examly.springapp.dto.VirtualBoothResponse;

public interface VirtualBoothService {

    VirtualBoothResponse createBooth(VirtualBoothRequest request);

    List<VirtualBoothResponse> getAllBooths();

    VirtualBoothResponse getBoothById(Long id);

    List<VirtualBoothResponse> getBoothsByEvent(Long eventId);

    VirtualBoothResponse updateBooth(Long id, VirtualBoothRequest request);

    VirtualBoothResponse recordVisit(Long id);

    VirtualBoothResponse recordLead(Long id);

    // Changed from void to VirtualBoothResponse
    VirtualBoothResponse deleteBooth(Long id);
}