package com.examly.springapp.service.Impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.examly.springapp.dto.VirtualBoothRequest;
import com.examly.springapp.dto.VirtualBoothResponse;
import com.examly.springapp.model.Event;
import com.examly.springapp.model.User;
import com.examly.springapp.model.VirtualBooth;
import com.examly.springapp.repository.EventRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.repository.VirtualBoothRepository;
import com.examly.springapp.service.VirtualBoothService;

@Service
public class VirtualBoothServiceImpl implements VirtualBoothService {

    private final VirtualBoothRepository repository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public VirtualBoothServiceImpl(VirtualBoothRepository repository,
            EventRepository eventRepository,
            UserRepository userRepository) {
        this.repository = repository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Override
    public VirtualBoothResponse createBooth(VirtualBoothRequest request) {

        Event event = getEvent(request.getEventId());
        User sponsor = getSponsor(request.getSponsorId());

        VirtualBooth booth = new VirtualBooth();
        booth.setEvent(event);
        booth.setSponsor(sponsor);
        booth.setVisitCount(0);
        booth.setLeadCount(0);

        applyFields(booth, request);

        return toResponse(repository.save(booth));
    }

    @Override
    public List<VirtualBoothResponse> getAllBooths() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VirtualBoothResponse getBoothById(Long id) {
        return toResponse(getBooth(id));
    }

    @Override
    public List<VirtualBoothResponse> getBoothsByEvent(Long eventId) {
        return repository.findByEventId(eventId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VirtualBoothResponse updateBooth(Long id, VirtualBoothRequest request) {

        VirtualBooth booth = getBooth(id);

        if (request.getEventId() != null) {
            booth.setEvent(getEvent(request.getEventId()));
        }

        if (request.getSponsorId() != null) {
            booth.setSponsor(getSponsor(request.getSponsorId()));
        }

        applyFields(booth, request);

        return toResponse(repository.save(booth));
    }

    @Override
    public VirtualBoothResponse recordVisit(Long id) {

        VirtualBooth booth = getBooth(id);

        booth.setVisitCount(
                (booth.getVisitCount() == null ? 0 : booth.getVisitCount()) + 1);

        return toResponse(repository.save(booth));
    }

    @Override
    public VirtualBoothResponse recordLead(Long id) {

        VirtualBooth booth = getBooth(id);

        booth.setLeadCount(
                (booth.getLeadCount() == null ? 0 : booth.getLeadCount()) + 1);

        return toResponse(repository.save(booth));
    }

    @Override
    public VirtualBoothResponse deleteBooth(Long id) {

        VirtualBooth booth = getBooth(id);

        VirtualBoothResponse response = toResponse(booth);

        repository.delete(booth);

        return response;
    }

    // ---------------- Helper Methods ----------------

    private VirtualBooth getBooth(Long id) {

        VirtualBooth booth = repository.findById(id).orElse(null);

        if (booth == null) {
            throw new RuntimeException("Virtual booth not found with id: " + id);
        }

        return booth;
    }

    private Event getEvent(Long id) {

        Event event = eventRepository.findById(id).orElse(null);

        if (event == null) {
            throw new RuntimeException("Event not found with id: " + id);
        }

        return event;
    }

    private User getSponsor(Long id) {

        User sponsor = userRepository.findById(id).orElse(null);

        if (sponsor == null) {
            throw new RuntimeException("User not found with id: " + id);
        }

        return sponsor;
    }

    private void applyFields(VirtualBooth booth, VirtualBoothRequest request) {

        booth.setBoothName(request.getBoothName());
        booth.setBoothConfig(request.getBoothConfig());
        booth.setBrandingConfig(request.getBrandingConfig());
        booth.setStaffMembers(request.getStaffMembers());
    }

    private VirtualBoothResponse toResponse(VirtualBooth booth) {

        VirtualBoothResponse response = new VirtualBoothResponse();

        response.setId(booth.getId());
        response.setEventId(
                booth.getEvent() != null ? booth.getEvent().getId() : null);
        response.setSponsorId(
                booth.getSponsor() != null ? booth.getSponsor().getId() : null);
        response.setBoothName(booth.getBoothName());
        response.setBoothConfig(booth.getBoothConfig());
        response.setBrandingConfig(booth.getBrandingConfig());
        response.setStaffMembers(booth.getStaffMembers());
        response.setVisitCount(booth.getVisitCount());
        response.setLeadCount(booth.getLeadCount());
        response.setCreatedDate(booth.getCreatedDate());

        return response;
    }
}