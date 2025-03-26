import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import api from '../services/api';

// Define types
type User = {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatar_url?: string;
  is_premium: boolean;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component
type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  // Get current user
  const { isLoading, error } = useQuery(
    'user',
    async () => {
      try {
        const response = await api.get('/api/user');
        setUser(response.data);
        return response.data;
      } catch (error) {
        // If the user is not logged in, we don't want to show an error
        if ((error as any)?.response?.status === 401) {
          setUser(null);
          return null;
        }
        throw error;
      }
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Login mutation
  const loginMutation = useMutation(
    async (credentials: { email: string; password: string }) => {
      const response = await api.post('/api/login', credentials);
      return response.data;
    },
    {
      onSuccess: (data) => {
        setUser(data);
      },
    }
  );

  // Register mutation
  const registerMutation = useMutation(
    async (userData: { username: string; email: string; password: string }) => {
      const response = await api.post('/api/register', userData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        setUser(data);
      },
    }
  );

  // Logout mutation
  const logoutMutation = useMutation(
    async () => {
      await api.post('/api/logout');
    },
    {
      onSuccess: () => {
        setUser(null);
      },
    }
  );

  // Login function
  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    await registerMutation.mutateAsync({ username, email, password });
  };

  // Logout function
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}