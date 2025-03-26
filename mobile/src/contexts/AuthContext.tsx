import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { api } from '../services/api';

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Check for existing user session
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);

        // Try to get user from API
        const currentUser = await api.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error loading user', err);
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error('Failed to load user'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      const loggedInUser = await api.login(email, password);
      setUser(loggedInUser);
      setError(null);
      return loggedInUser;
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
        throw err;
      }
      const error = new Error('Failed to log in');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      const newUser = await api.register(username, email, password);
      setUser(newUser);
      setError(null);
      return newUser;
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
        throw err;
      }
      const error = new Error('Failed to register');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await api.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      // Even if logout API fails, we clear the user locally
      setUser(null);
      
      if (err instanceof Error) {
        setError(err);
        throw err;
      }
      const error = new Error('Failed to log out');
      setError(error);
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

export { AuthProvider };