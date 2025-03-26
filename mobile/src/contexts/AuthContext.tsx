import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      setIsLoading(true);
      try {
        const user = await api.auth.getCurrentUser();
        setUser(user);
      } catch (error) {
        // User is not logged in or there was an error
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await api.auth.login(email, password);
      setUser(user);
      return user;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Login failed'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await api.auth.register(username, email, password);
      setUser(user);
      return user;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Registration failed'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.auth.logout();
      setUser(null);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Logout failed'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// React Query wrapper for Auth Provider
export function AuthProviderWithReactQuery({ children }: AuthProviderProps) {
  // Use the existing query client from App.tsx or create a new one if needed
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}