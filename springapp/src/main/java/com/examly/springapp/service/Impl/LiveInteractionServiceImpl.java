package com.examly.springapp.service.Impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.examly.springapp.dto.LiveInteractionRequest;
import com.examly.springapp.dto.LiveInteractionResponse;
import com.examly.springapp.model.LiveInteraction;
import com.examly.springapp.model.Session;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.LiveInteractionRepository;
import com.examly.springapp.repository.SessionRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.LiveInteractionService;

@Service
public class LiveInteractionServiceImpl implements LiveInteractionService {

        private final LiveInteractionRepository repository;
        private final SessionRepository sessionRepository;
        private final UserRepository userRepository;

        public LiveInteractionServiceImpl(
                        LiveInteractionRepository repository,
                        SessionRepository sessionRepository,
                        UserRepository userRepository) {

                this.repository = repository;
                this.sessionRepository = sessionRepository;
                this.userRepository = userRepository;
        }

        @Override
        public LiveInteractionResponse createInteraction(
                        LiveInteractionRequest request,
                        String loggedInUsername) {

                Session session = sessionRepository.findById(request.getSessionId())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Session not found with id: " + request.getSessionId()));

                User user = userRepository.findByUsername(loggedInUsername)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found."));

                LiveInteraction interaction = new LiveInteraction();

                interaction.setSession(session);
                interaction.setUser(user);
                interaction.setInteractionType(request.getInteractionType());
                interaction.setContent(request.getContent());
                interaction.setMetadata(request.getMetadata());

                // Backend controls moderation flags
                interaction.setIsModerated(false);
                interaction.setIsApproved(true);

                return toResponse(repository.save(interaction));
        }

        @Override
        public List<LiveInteractionResponse> getAllInteractions() {

                return repository.findAll()
                                .stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public LiveInteractionResponse getInteractionById(Long id) {

                LiveInteraction interaction = repository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Interaction not found with id: " + id));

                return toResponse(interaction);
        }

        @Override
        public List<LiveInteractionResponse> getInteractionsBySession(Long sessionId) {

                return repository.findBySessionId(sessionId)
                                .stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public LiveInteractionResponse moderateInteraction(
                        Long id,
                        boolean approved) {

                LiveInteraction interaction = repository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Interaction not found with id: " + id));

                interaction.setIsModerated(true);
                interaction.setIsApproved(approved);

                return toResponse(repository.save(interaction));
        }

        @Override
        public void deleteInteraction(Long id) {

                if (!repository.existsById(id)) {

                        throw new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Interaction not found with id: " + id);
                }

                repository.deleteById(id);
        }

        private LiveInteractionResponse toResponse(
                        LiveInteraction interaction) {

                LiveInteractionResponse response = new LiveInteractionResponse();

                response.setId(interaction.getId());

                response.setSessionId(
                                interaction.getSession() != null
                                                ? interaction.getSession().getId()
                                                : null);

                response.setSessionTitle(
                                interaction.getSession() != null
                                                ? interaction.getSession().getTitle()
                                                : null);

                response.setUserId(
                                interaction.getUser() != null
                                                ? interaction.getUser().getId()
                                                : null);

                response.setUsername(
                                interaction.getUser() != null
                                                ? interaction.getUser().getUsername()
                                                : null);

                response.setInteractionType(interaction.getInteractionType());
                response.setContent(interaction.getContent());
                response.setMetadata(interaction.getMetadata());
                response.setIsModerated(interaction.getIsModerated());
                response.setIsApproved(interaction.getIsApproved());
                response.setTimestamp(interaction.getTimestamp());

                return response;
        }
}