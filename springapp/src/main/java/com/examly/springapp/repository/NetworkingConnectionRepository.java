package com.examly.springapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.NetworkingConnection;

@Repository
public interface NetworkingConnectionRepository
        extends JpaRepository<NetworkingConnection, Long> {

    List<NetworkingConnection> findByEventId(Long eventId);

    List<NetworkingConnection> findByRequesterId(Long requesterId);

    List<NetworkingConnection> findByRecipientId(Long recipientId);

    List<NetworkingConnection> findByRequesterIdOrRecipientId(
            Long requesterId,
            Long recipientId);

    // Prevent duplicate connection request
    boolean existsByRequesterIdAndRecipientId(
            Long requesterId,
            Long recipientId);

    // Prevent reverse duplicate
    boolean existsByRequesterIdAndRecipientIdOrRequesterIdAndRecipientId(
            Long requester1,
            Long recipient1,
            Long requester2,
            Long recipient2);
}