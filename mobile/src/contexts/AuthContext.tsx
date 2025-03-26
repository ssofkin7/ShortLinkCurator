import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { User } from '../types';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if user is logged in on app startup
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const currentUser = await api.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Failed to check auth status:', err);
        // We don't set an error here since this is an automatic check
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setError(null);
      const loggedInUser = await api.login(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Login failed');
      setError(error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<User> => {
    try {
      setError(null);
      const newUser = await api.register(username, email, password);
      setUser(newUser);
      return newUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Registration failed');
      setError(error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await api.logout();
      setUser(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Logout failed');
      setError(error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}