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
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user data from users table
        await fetchUserData(session.user.id);
      }
      
      setLoading(false);
    };

    getSession();

    // Listen for changes on auth state (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setUserData(data);
      
      // Update last access
      await supabase
        .from('users')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const signUp = async (email, password, additionalData) => {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Create user in users table
      if (authData.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            email: email,
            nombre_completo: additionalData.nombre_completo || '',
            organizacion: additionalData.organizacion || '',
            pais: additionalData.pais || '',
            departamento: additionalData.departamento || '',
            puesto: additionalData.puesto || '',
            telefono: additionalData.telefono || '',
            pais_telefono: additionalData.pais_telefono || '',
            anios_experiencia: additionalData.anios_experiencia || '',
            rol: additionalData.rol || 'cliente_gratuito',
            plan_actual: 'gratuito',
            suscripcion_activa: false,
            onboarding_completado: false,
            progreso_general: 0
          }]);

        if (insertError) throw insertError;
      }

      return { data: authData, error: null };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error };
    }
  };

  const updateUserData = async (updates) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      // Refresh user data
      await fetchUserData(user.id);
      
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
