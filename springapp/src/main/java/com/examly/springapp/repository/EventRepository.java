package com.examly.springapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

}