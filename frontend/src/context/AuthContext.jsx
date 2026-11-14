import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      if (res?.data?.user) {
        setUser(res.data.user);
        const legacyToken = localStorage.getItem('queueless_token');
        if (legacyToken) {
          if (!localStorage.getItem('kuefy_token')) {
            localStorage.setItem('kuefy_token', legacyToken);
          }
          localStorage.removeItem('queueless_token');
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem('kuefy_token');
      localStorage.removeItem('queueless_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // 1. Listen for global 401 unauthorized logout event
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('kuefy:unauthorized', handleUnauthorized);

    // 2. Tab focus / Window re-check: verifies user validity when returning to the tab
    let lastFocusCheck = 0;
    const handleFocus = async () => {
      const now = Date.now();
      if (now - lastFocusCheck < 10000) return;
      lastFocusCheck = now;

      const token = localStorage.getItem('kuefy_token') || localStorage.getItem('queueless_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res?.data?.user) {
            setUser(res.data.user);
          } else {
            setUser(null);
            localStorage.removeItem('kuefy_token');
            localStorage.removeItem('queueless_token');
          }
        } catch {
          setUser(null);
          localStorage.removeItem('kuefy_token');
          localStorage.removeItem('queueless_token');
          if (
            window.location.pathname.startsWith('/organization/') &&
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')
          ) {
            window.location.href = '/organization/login?expired=true';
          }
        }
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('kuefy:unauthorized', handleUnauthorized);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      if (res?.data?.token) {
        localStorage.setItem('kuefy_token', res.data.token);
        localStorage.removeItem('queueless_token');
      }
      setUser(res?.data?.user || null);
      return res?.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await authApi.register({ name, email, password });
      if (res?.data?.token) {
        localStorage.setItem('kuefy_token', res.data.token);
        localStorage.removeItem('queueless_token');
      }
      setUser(res?.data?.user || null);
      return res?.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const googleLogin = async (credential) => {
    setError(null);
    try {
      const res = await authApi.googleAuth(credential);
      if (res?.data?.token) {
        localStorage.setItem('kuefy_token', res.data.token);
        localStorage.removeItem('queueless_token');
      }
      setUser(res?.data?.user || null);
      return res?.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout request warning:', err.message);
    } finally {
      localStorage.removeItem('kuefy_token');
      localStorage.removeItem('queueless_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        googleLogin,
        logout,
        refreshUser: fetchUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
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
