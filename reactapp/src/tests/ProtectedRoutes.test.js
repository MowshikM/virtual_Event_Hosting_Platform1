import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const MockDashboard = () => <div>Dashboard Protected Content</div>;
const MockAdminUsers = () => <div>Admin Users Management</div>;
const MockLogin = () => <div>Login Page Redirect Target</div>;
const MockUnauthorized = () => <div>Unauthorized Page</div>;

describe('Protected Routes & Authorization Guard Tests', () => {
  test('1. Unauthenticated user is redirected to Login page', () => {
    const mockAuthContext = {
      isAuthenticated: false,
      role: null,
      username: null,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<MockLogin />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MockDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Login Page Redirect Target')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Protected Content')).not.toBeInTheDocument();
  });

  test('2. Authenticated user can access authorized protected route', () => {
    const mockAuthContext = {
      isAuthenticated: true,
      role: 'ATTENDEE',
      username: 'alex',
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MockDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Dashboard Protected Content')).toBeInTheDocument();
  });

  test('3. Non-admin user is redirected to Unauthorized when accessing admin page', () => {
    const mockAuthContext = {
      isAuthenticated: true,
      role: 'ATTENDEE',
      username: 'alex',
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter initialEntries={['/admin/users']}>
          <Routes>
            <Route path="/unauthorized" element={<MockUnauthorized />} />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MockAdminUsers />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Users Management')).not.toBeInTheDocument();
  });
});
