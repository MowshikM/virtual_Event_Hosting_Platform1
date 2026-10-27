import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Sessions from './pages/Sessions';
import VirtualBooths from './pages/VirtualBooths';
import Networking from './pages/Networking';
import Registrations from './pages/Registrations';
import Analytics from './pages/Analytics';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/events" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Authenticated Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/new"
                element={
                 <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'ORGANIZER']}>
                    <CreateEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'ORGANIZER']}>
                    <EditEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booths"
                element={
                  <ProtectedRoute>
                    <VirtualBooths />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/networking"
                element={
                  <ProtectedRoute>
                    <Networking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/registrations"
                element={
                  <ProtectedRoute>
                    <Registrations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'ORGANIZER', 'SPONSOR']}>                    <Analytics />
                  </ProtectedRoute>
                }
              />
             <Route
  path="/admin/users"
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <AdminUsers />
    </ProtectedRoute>
  }
/>
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {/* <Footer /> */}
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
