package com.examly.springapp;

import com.examly.springapp.configuration.CORSConfig;
import com.examly.springapp.controller.EventController;
import com.examly.springapp.model.Event;
import com.examly.springapp.repository.EventRepository;
import com.examly.springapp.service.EventService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({EventController.class, CORSConfig.class})
public class SpringappApplicationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EventService eventService;

    @MockBean
    private EventRepository eventRepository;

    private Event sampleEvent;
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        sampleEvent = new Event();
        sampleEvent.setId(1L);
        sampleEvent.setTitle("Tech Talk");
        sampleEvent.setDescription("Discussing emerging tech");
        sampleEvent.setDateTime(LocalDateTime.of(2025, 8, 15, 10, 0));
        sampleEvent.setOrganizerName("Jane Doe");
        sampleEvent.setEventLink("https://zoom.us/test");
        sampleEvent.setAttendees(new HashSet<>(Collections.singletonList("Alice")));
    }

    @Test
    public void SpringBoot_DevelopCoreAPIsAndBusinessLogic_getAllEventsReturnsEventList() throws Exception {
        List<Event> events = Collections.singletonList(sampleEvent);
        when(eventService.getAllEvents()).thenReturn(events);

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Tech Talk"));
    }

    @Test
    public void SpringBoot_DevelopCoreAPIsAndBusinessLogic_createEventReturnsCreatedEvent() throws Exception {
        when(eventService.createEvent(any(Event.class))).thenReturn(sampleEvent);

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleEvent)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Tech Talk"));
    }

    @Test
    public void SpringBoot_DevelopCoreAPIsAndBusinessLogic_rsvpToEventReturnsUpdatedEvent() throws Exception {
        sampleEvent.getAttendees().add("Bob");
        when(eventService.rsvpToEvent(eq(1L), eq("Bob"))).thenReturn(sampleEvent);

        mockMvc.perform(post("/api/events/1/rsvp?attendee=Bob"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attendees.length()").value(2));
    }



    @Test
    public void SpringBoot_DatabaseAndSchemaSetup_eventModelGettersWorkCorrectly() {
        Event event = new Event();
        event.setTitle("Test");
        event.setDescription("Desc");
        event.setDateTime(LocalDateTime.now());
        event.setOrganizerName("Org");
        event.setEventLink("link");
        event.setAttendees(new HashSet<>(Arrays.asList("X", "Y")));

        assert event.getTitle().equals("Test");
        assert event.getDescription().equals("Desc");
        assert event.getOrganizerName().equals("Org");
        assert event.getEventLink().equals("link");
        assert event.getAttendees().contains("X");
    }

    @Test
    public void SpringBoot_DevelopCoreAPIsAndBusinessLogic_createEventWithMultipleAttendees() throws Exception {
        sampleEvent.setAttendees(new HashSet<>(Arrays.asList("Alice", "Bob")));
        when(eventService.createEvent(any(Event.class))).thenReturn(sampleEvent);

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleEvent)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attendees.length()").value(2));
    }

  

    @Test
    public void SpringBoot_DevelopCoreAPIsAndBusinessLogic_getAllEventsEmptyReturnsEmptyList() throws Exception {
        when(eventService.getAllEvents()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    public void SpringBoot_DevelopCoreAPIsAndBusinessLogic_createEventWithoutAttendees() throws Exception {
        sampleEvent.setAttendees(new HashSet<>());
        when(eventService.createEvent(any(Event.class))).thenReturn(sampleEvent);

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleEvent)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attendees.length()").value(0));
    }

    @Test
    public void SpringBoot_DevelopCoreAPIsAndBusinessLogic_rsvpToEventAddsNewAttendee() throws Exception {
        sampleEvent.getAttendees().add("Charlie");
        when(eventService.rsvpToEvent(eq(1L), eq("Charlie"))).thenReturn(sampleEvent);

        mockMvc.perform(post("/api/events/1/rsvp?attendee=Charlie"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attendees.length()").value(2));
    }

    @Test
    public void SpringBoot_DevelopCoreAPIsAndBusinessLogic_createEventReturnsCorrectLink() throws Exception {
        when(eventService.createEvent(any(Event.class))).thenReturn(sampleEvent);

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleEvent)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventLink").value("https://zoom.us/test"));
    }
    @Test
    public void SpringBoot_DevelopCoreAPIsAndBusinessLogic_createEventWithEmptyTitleReturnsValidResponse() throws Exception {
        sampleEvent.setTitle("");
        when(eventService.createEvent(any(Event.class))).thenReturn(sampleEvent);
    
        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleEvent)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value(""));
    }
    
    @Test
public void SpringBoot_DevelopCoreAPIsAndBusinessLogic_rsvpToEventWithExistingAttendeeDoesNotDuplicate() throws Exception {
    sampleEvent.setAttendees(new HashSet<>(List.of("Alice"))); // Already has Alice
    when(eventService.rsvpToEvent(1L, "Alice")).thenReturn(sampleEvent);

    mockMvc.perform(post("/api/events/1/rsvp?attendee=Alice"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.attendees.length()").value(1)); // Still only 1
}

}
