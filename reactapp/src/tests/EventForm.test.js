import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import CreateEvent from '../pages/CreateEvent';
import eventService from '../services/eventService';

jest.mock('../services/eventService');

describe('Event Creation UI Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('1. CreateEvent form renders with required inputs', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <CreateEvent />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/Host a New Virtual Event/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date & Start Time/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publish Event/i })).toBeInTheDocument();
  });

  test('2. Form validates required fields on submission', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <CreateEvent />
        </BrowserRouter>
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Publish Event/i }));

    expect(await screen.findByText(/Event title is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Event description is required/i)).toBeInTheDocument();
  });

  test('3. Submitting valid form calls eventService.createEvent with payload', async () => {
    eventService.createEvent.mockResolvedValueOnce({
      id: 10,
      title: 'DevOps Summit 2026',
      description: 'CI/CD and Kubernetes Masterclass',
      dateTime: '2026-11-10T14:00',
      eventLink: 'https://devops.stream',
      attendees: [],
    });

    render(
      <AuthProvider>
        <BrowserRouter>
          <CreateEvent />
        </BrowserRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/Event Title/i), {
      target: { value: 'DevOps Summit 2026' },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'CI/CD and Kubernetes Masterclass' },
    });
    fireEvent.change(screen.getByLabelText(/Date & Start Time/i), {
      target: { value: '2026-11-10T14:00' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Publish Event/i }));

    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalledWith({
        title: 'DevOps Summit 2026',
        description: 'CI/CD and Kubernetes Masterclass',
        dateTime: '2026-11-10T14:00',
        eventLink: '',
        attendees: [],
      });
    });
  });
});
