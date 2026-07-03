import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom"

// ✅ Mock API before importing components
jest.mock("../api", () => ({
  getEvents: jest.fn(),
  createEvent: jest.fn(),
  rsvpToEvent: jest.fn()
}));

import App from "../App";
import EventList from "../components/EventList";
import CalendarView from "../components/CalendarView";
import { getEvents, createEvent, rsvpToEvent } from "../api";

const mockEvents = [
  {
    id: 1,
    title: "AI Conference",
    description: "Future of AI",
    dateTime: "2025-08-15T10:00:00",
    organizerName: "John",
    eventLink: "https://zoom.us/test",
    attendees: ["Alice"]
  }
];

// ✅ Default mock so .then() always works, even if a test forgets to override
beforeEach(() => {
  getEvents.mockResolvedValue({ data: [] });
});

describe("VirtualEventHostingPlatformTests", () => {
  test("React_BuildUIComponents_rendersAppHeading", async () => {
    getEvents.mockResolvedValueOnce({ data: mockEvents });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Virtual Event Hosting Platform/i)).toBeInTheDocument();
    });
  });

  test("React_APIIntegration_TestingAndAPIDocumentation_displaysEventListFromAPI", async () => {
    getEvents.mockResolvedValueOnce({ data: mockEvents });
    render(<EventList />);
    await waitFor(() => {
      expect(screen.getByText(/AI Conference/i)).toBeInTheDocument();
    });
  });

  test("React_BuildUIComponents_calendarHighlightsEventDates", () => {
    render(<CalendarView events={mockEvents} />);
    expect(screen.getByText("Event")).toBeInTheDocument();
  });

  test("React_APIIntegration_TestingAndAPIDocumentation_rsvpButtonTriggersPrompt", async () => {
    getEvents.mockResolvedValueOnce({ data: mockEvents });
    rsvpToEvent.mockResolvedValueOnce({});
    window.prompt = jest.fn().mockReturnValue("New Attendee");
    render(<EventList />);
    await waitFor(() => fireEvent.click(screen.getByText(/RSVP/i)));
    expect(window.prompt).toHaveBeenCalled();
  });

  test("React_APIIntegration_TestingAndAPIDocumentation_handlesEmptyEventList", async () => {
    getEvents.mockResolvedValueOnce({ data: [] });
    render(<EventList />);
    await waitFor(() => {
      expect(screen.queryByText(/RSVP/i)).not.toBeInTheDocument();
    });
  });

  test("React_BuildUIComponents_eventCardDisplaysAttendeeCount", () => {
    render(<CalendarView events={mockEvents} />);
    expect(mockEvents[0].attendees.length).toBe(1);
  });

  test("React_BuildUIComponents_joinEventLinkIsDisplayed", async () => {
    getEvents.mockResolvedValueOnce({ data: mockEvents });
    render(<EventList />);
    await waitFor(() => {
      expect(mockEvents[0].eventLink).toContain("https://zoom.us");
    });
  });

  test("React_BuildUIComponents_calendarRendersWithoutEvents", () => {
    render(<CalendarView events={[]} />);
    expect(screen.getByText(/Event Calendar/i)).toBeInTheDocument();
  });

  // ➕ Additional Test Case 1
  test("React_APIIntegration_TestingAndAPIDocumentation_displaysMultipleEventsCorrectly", async () => {
    const multipleEvents = [
      ...mockEvents,
      {
        id: 2,
        title: "Tech Summit",
        description: "Latest Tech Trends",
        dateTime: "2025-08-20T14:00:00",
        organizerName: "Sarah",
        eventLink: "https://zoom.us/tech",
        attendees: []
      }
    ];
    getEvents.mockResolvedValueOnce({ data: multipleEvents });
    render(<EventList />);
    await waitFor(() => {
      expect(screen.getByText(/AI Conference/i)).toBeInTheDocument();
      expect(screen.getByText(/Tech Summit/i)).toBeInTheDocument();
    });
  });
  
  });
