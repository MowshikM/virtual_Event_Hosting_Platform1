import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Events from '../pages/Events';
import eventService from '../services/eventService';

jest.mock('../services/eventService');

const mockEvents = [
  {
    id: 1,
    title: 'Cloud Summit 2026',
    description: 'Annual cloud computing conference.',
    dateTime: '2026-10-15T09:00:00',
    eventLink: 'https://stream.example.com',
    organizerId: 1,
    organizerName: 'CloudOrg',
    attendees: ['alice', 'bob'],
  },
  {
    id: 2,
    title: 'AI & Data Expo',
    description: 'Deep dive into machine learning and neural architectures.',
    dateTime: '2026-11-20T10:00:00',
    eventLink: 'https://ai.example.com',
    organizerId: 2,
    organizerName: 'AIOrg',
    attendees: ['charlie'],
  },
];

describe('Events Catalog UI Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('1. Loading state appears initially while fetching events', () => {
    eventService.getAllEvents.mockReturnValue(new Promise(() => {})); // pending

    render(
      <AuthProvider>
        <BrowserRouter>
          <Events />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/Fetching virtual events/i)).toBeInTheDocument();
  });

  test('2. Event list renders successfully with mocked API data', async () => {
    eventService.getAllEvents.mockResolvedValue(mockEvents);

    render(
      <AuthProvider>
        <BrowserRouter>
          <Events />
        </BrowserRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Cloud Summit 2026')).toBeInTheDocument();
      expect(screen.getByText('AI & Data Expo')).toBeInTheDocument();
      expect(screen.getByText('CloudOrg')).toBeInTheDocument();
    });
  });

  test('3. Error state appears gracefully if backend API fails', async () => {
    eventService.getAllEvents.mockRejectedValue(new Error('Network error: server unreachable'));

    render(
      <AuthProvider>
        <BrowserRouter>
          <Events />
        </BrowserRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Network error: server unreachable/i)).toBeInTheDocument();
    });
  });

  test('4. Empty state is displayed when no events exist', async () => {
    eventService.getAllEvents.mockResolvedValue([]);

    render(
      <AuthProvider>
        <BrowserRouter>
          <Events />
        </BrowserRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/No events found/i)).toBeInTheDocument();
    });
  });
});
