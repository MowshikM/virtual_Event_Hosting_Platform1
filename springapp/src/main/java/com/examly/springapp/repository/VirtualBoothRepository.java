package com.examly.springapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.VirtualBooth;

@Repository
public interface VirtualBoothRepository extends JpaRepository<VirtualBooth, Long> {

    List<VirtualBooth> findByEventId(Long eventId);

    List<VirtualBooth> findBySponsorId(Long sponsorId);
}