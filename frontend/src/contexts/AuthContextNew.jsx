import React, { createContext, useContext, useEffect, useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const checkAuth = () => {
      const savedUser = localStorage.getItem('clarisa_user');
      const sessionToken = localStorage.getItem('clarisa_session');
      
      if (savedUser && sessionToken) {
        const parsedUser = JSON.parse(savedUser);
        setUser({ id: parsedUser.id, email: parsedUser.email });
        setUserData(parsedUser);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signUp = async (email, password, additionalData) => {
    try {
      const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          nombre_completo: additionalData.nombre_completo || '',
          organizacion: additionalData.organizacion || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al registrar usuario');
      }

      const data = await response.json();
      
      // Save to localStorage
      localStorage.setItem('clarisa_user', JSON.stringify(data.user));
      localStorage.setItem('clarisa_session', data.session_token);
      
      setUser({ id: data.user.id, email: data.user.email });
      setUserData(data.user);

      return { data, error: null };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al iniciar sesión');
      }

      const data = await response.json();
      
      // Save to localStorage
      localStorage.setItem('clarisa_user', JSON.stringify(data.user));
      localStorage.setItem('clarisa_session', data.session_token);
      
      setUser({ id: data.user.id, email: data.user.email });
      setUserData(data.user);

      return { data, error: null };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('clarisa_user');
      localStorage.removeItem('clarisa_session');
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    // Simplified - not implemented yet
    return { error: { message: 'Reset password not implemented yet' } };
  };

  const updateUserData = async (updates) => {
    try {
      // Update in localStorage
      const updatedUser = { ...userData, ...updates };
      localStorage.setItem('clarisa_user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      
      return { error: null };
    } catch (error) {
      console.error('Error updating user data:', error);
      return { error };
    }
  };

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserData,
    isAuthenticated: !!user,
    isAdmin: userData?.rol === 'admin',
    isPaidClient: userData?.rol === 'cliente_pagado',
    isFreeClient: userData?.rol === 'cliente_gratuito',
    isLead: userData?.rol === 'lead',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
