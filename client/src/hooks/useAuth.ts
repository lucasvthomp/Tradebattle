import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Don't throw on 401 errors - just return null
    throwOnError: false,
  });

  // If there's a 401 error, the user is not authenticated
  const isUnauthenticated = error && error.message?.includes('401');

  return {
    user: isUnauthenticated ? null : user,
    isLoading: isLoading && !isUnauthenticated,
    isAuthenticated: !!user && !isUnauthenticated,
  };
}
