import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('workpulse_token') || null);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      await refreshAttendance();
    } catch (err) {
      console.error('Failed to load user profile', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const refreshAttendance = async () => {
    try {
      const data = await api.getTodayStatus();
      setTodayAttendance(data);
    } catch (err) {
      console.error('Failed to fetch attendance state', err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const data = await api.login({ identifier, password });
      localStorage.setItem('workpulse_token', data.token);
      setToken(data.token);
      setUser(data.user);
      await refreshAttendance();
      return data.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await api.register(userData);
      localStorage.setItem('workpulse_token', data.token);
      setToken(data.token);
      setUser(data.user);
      await refreshAttendance();
      return data.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const data = await api.updateProfile(profileData);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('workpulse_token');
    setToken(null);
    setUser(null);
    setTodayAttendance(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        todayAttendance,
        refreshAttendance,
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
