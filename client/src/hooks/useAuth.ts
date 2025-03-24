import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/user"],
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: false,
    refetchOnWindowFocus: true,
  });

  const isAuthenticated = useMemo(() => {
    return !!user && !error;
  }, [user, error]);

  const isAdmin = useMemo(() => {
    // You can implement admin role checking here
    return false;
  }, [user]);

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
  };
}
