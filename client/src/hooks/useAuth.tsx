import { useState, useEffect, createContext, useContext } from 'react';
import type { User, AuthResponse } from '../types';
import { authAPI } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const guestUser = localStorage.getItem('guestUser');
      
      if (guestUser) {
        setUser(JSON.parse(guestUser));
        setLoading(false);
      } else if (token) {
        try {
          const response = await authAPI.getProfile();
          if (response.data.success) {
            setUser(response.data.data);
          }
        } catch (err) {
          localStorage.removeItem('token');
          console.error('Auth initialization failed:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(email, password);
      if (response.data.success) {
        const data = response.data.data as AuthResponse;
        localStorage.setItem('token', data.token);
        setUser(data.user);
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register(name, email, password);
      if (response.data.success) {
        const data = response.data.data as AuthResponse;
        localStorage.setItem('token', data.token);
        setUser(data.user);
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      id: 'guest-' + Date.now(),
      email: 'guest@matemenu.com',
      name: 'Guest Explorer',
      allergies: ['peanuts', 'shellfish'],
      dietaryPreferences: ['gluten-free'],
      isGuest: true
    };
    
    localStorage.setItem('guestUser', JSON.stringify(guestUser));
    localStorage.setItem('guestScanHistory', JSON.stringify([]));
    setUser(guestUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('guestUser');
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    loginAsGuest,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}