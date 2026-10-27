import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [email, setEmail] = useState(localStorage.getItem('email') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [loading, setLoading] = useState(true);

  // Restore auth state on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    const storedEmail = localStorage.getItem('email');
    const storedUserId = localStorage.getItem('userId');

    if (storedToken) {
      setToken(storedToken);
      setUsername(storedUsername);
      setRole(storedRole);
      setEmail(storedEmail);
      if (storedUserId) setUserId(storedUserId);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (emailInput, password) => {
    // Backend login uses email + password
    const data = await authService.login({ email: emailInput, password });
    
    // data: { token, username, role }
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username || '');
      localStorage.setItem('role', data.role || '');
      localStorage.setItem('email', emailInput);
localStorage.setItem('userId', String(data.userId));

setToken(data.token);
setUsername(data.username || '');
setRole(data.role || '');
setEmail(emailInput);
setUserId(String(data.userId));
    }
    return data;
  }, []);

  const register = useCallback(async (registerData) => {
    // registerData: { username, email, password, role }
    return await authService.register(registerData);
  }, []);

  const updateUserId = useCallback((id) => {
    if (id) {
      localStorage.setItem('userId', String(id));
      setUserId(String(id));
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUsername(null);
    setRole(null);
    setEmail(null);
    setUserId(null);
    localStorage.removeItem('userId');
  }, []);

  const value = {
    token,
    username,
    role,
    email,
    userId,
    updateUserId,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
