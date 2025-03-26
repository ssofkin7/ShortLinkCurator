import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, type User } from '../services/api';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authentication provider component
export default function AuthProvider({ children }: AuthProviderProps) {
  const [initializing, setInitializing] = useState(true);

  // Fetch current user
  const {
    data: user,
    error,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await api.auth.getCurrentUser();
      } catch (error) {
        // Clear any invalid session
        await AsyncStorage.removeItem('auth_token');
        return null;
      }
    },
    // Don't automatically fetch on mount - we'll handle this ourselves
    enabled: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return await api.auth.login(email, password);
    },
    onSuccess: (data) => {
      // Update user in cache
      queryClient.setQueryData(['user'], data);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async ({ username, email, password }: { username: string; email: string; password: string }) => {
      return await api.auth.register(username, email, password);
    },
    onSuccess: (data) => {
      // Update user in cache
      queryClient.setQueryData(['user'], data);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.auth.logout();
    },
    onSuccess: () => {
      // Clear user from cache
      queryClient.setQueryData(['user'], null);
      // Invalidate all queries
      queryClient.invalidateQueries();
    },
  });

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      await refetchUser();
      setInitializing(false);
    };

    checkAuthStatus();
  }, [refetchUser]);

  // Wrapper functions for mutations
  const login = async (email: string, password: string) => {
    return loginMutation.mutateAsync({ email, password });
  };

  const register = async (username: string, email: string, password: string) => {
    return registerMutation.mutateAsync({ username, email, password });
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  // Calculate loading state
  const isLoading = initializing || isUserLoading || 
    loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending;

  // Context value
  const contextValue: AuthContextType = {
    user: user || null,
    isLoading,
    error: error instanceof Error ? error : null,
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

// Auth context provider with QueryClient
export function AuthProviderWithReactQuery({ children }: AuthProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}