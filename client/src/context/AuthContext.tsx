import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('raksha_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session or default to citizen demo user
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('raksha_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          setIsLoading(false);
          return;
        } catch {
          localStorage.removeItem('raksha_token');
          setToken(null);
        }
      }

      // Default load demo citizen user for immediate interactive use
      try {
        const demoRes = await api.demoSwitch('citizen');
        setUser(demoRes.user);
        setToken(demoRes.token);
        localStorage.setItem('raksha_token', demoRes.token);
      } catch (err) {
        console.warn('Could not auto-load demo user:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('raksha_token', res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('raksha_token', res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('raksha_token');
  };

  const switchRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.demoSwitch(targetRole);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('raksha_token', res.token);
    } catch (err) {
      console.error('Failed to switch role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'citizen',
        token,
        isLoading,
        login,
        register,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
