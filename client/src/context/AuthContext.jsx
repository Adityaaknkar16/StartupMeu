import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { useToast } from './ToastContext';
import { MESSAGES } from '../constants/messages';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('flowdeck_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError, showInfo } = useToast();

  // Load session on startup
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const storedToken = localStorage.getItem('flowdeck_token');
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (isMounted && response.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.warn('Session verification failed:', error.message);
        localStorage.removeItem('flowdeck_token');
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    restoreSession();

    // Event listener for expired sessions from Axios interceptor
    const handleSessionExpired = () => {
      logout(false);
      showError(MESSAGES.AUTH.SESSION_EXPIRED);
    };

    window.addEventListener('flowdeck:session-expired', handleSessionExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('flowdeck:session-expired', handleSessionExpired);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      if (res.success) {
        const { user: userData, token: userToken } = res.data;
        localStorage.setItem('flowdeck_token', userToken);
        setToken(userToken);
        setUser(userData);
        showSuccess(res.message || MESSAGES.AUTH.LOGIN_SUCCESS(userData.name));
        return { success: true, user: userData };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showError(err.message || MESSAGES.AUTH.INVALID_CREDENTIALS);
      return {
        success: false,
        message: err.message,
        code: err.code,
        errors: err.errors || []
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await authApi.register({ name, email, password });
      if (res.success) {
        const { user: userData, token: userToken } = res.data;
        localStorage.setItem('flowdeck_token', userToken);
        setToken(userToken);
        setUser(userData);
        showSuccess(res.message || MESSAGES.AUTH.REGISTER_SUCCESS);
        return { success: true, user: userData };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showError(err.message || MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED);
      return {
        success: false,
        message: err.message,
        code: err.code,
        errors: err.errors || []
      };
    }
  };

  const logout = useCallback(async (notify = true) => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('flowdeck_token');
      setUser(null);
      setToken(null);
      if (notify) {
        showInfo(MESSAGES.AUTH.LOGOUT_SUCCESS);
      }
    }
  }, [showInfo]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout
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
