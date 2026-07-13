package com.examly.springapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.LiveInteraction;

@Repository
public interface LiveInteractionRepository extends JpaRepository<LiveInteraction, Long> {

    List<LiveInteraction> findBySessionId(Long sessionId);

    List<LiveInteraction> findByUserId(Long userId);
}