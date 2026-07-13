package com.examly.springapp.service;

import java.util.List;

import com.examly.springapp.dto.LiveInteractionRequest;
import com.examly.springapp.dto.LiveInteractionResponse;

public interface LiveInteractionService {

    // Create chat message (logged-in user)
    LiveInteractionResponse createInteraction(
            LiveInteractionRequest request,
            String loggedInUsername);

    // Admin / Organizer
    List<LiveInteractionResponse> getAllInteractions();

    // Everyone
    LiveInteractionResponse getInteractionById(Long id);

    // Everyone
    List<LiveInteractionResponse> getInteractionsBySession(Long sessionId);

    // Admin / Organizer (Moderate chat)
    LiveInteractionResponse moderateInteraction(
            Long id,
            boolean approved);

    // Admin only
    void deleteInteraction(Long id);
}