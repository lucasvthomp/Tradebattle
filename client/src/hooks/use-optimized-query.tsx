import { useQuery, UseQueryOptions } from "@tanstack/react-query";

// Optimized query hook with smart defaults
export function useOptimizedQuery<T>(
  queryKey: string[],
  options?: Partial<UseQueryOptions<T>>,
  cacheTime?: {
    staleTime?: number;
    gcTime?: number;
    refetchInterval?: number | false;
  }
) {
  const defaultCacheTime = {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false,
    ...cacheTime
  };

  return useQuery<T>({
    queryKey,
    staleTime: defaultCacheTime.staleTime,
    gcTime: defaultCacheTime.gcTime,
    refetchInterval: defaultCacheTime.refetchInterval,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    retryDelay: 1000,
    ...options,
  });
}

// Specific query hooks for common data
export const usePopularStocks = (enabled = true) => 
  useOptimizedQuery(
    ["/api/popular"],
    { enabled },
    { 
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 30000 // 30 seconds
    }
  );

export const useTournaments = () =>
  useOptimizedQuery(
    ["/api/tournaments/public"],
    {},
    { staleTime: 1 * 60 * 1000 } // 1 minute
  );

export const useLeaderboard = (type: 'tournaments' | 'personal' | 'streaks') =>
  useOptimizedQuery(
    [`/api/leaderboard/${type}`],
    {},
    { 
      staleTime: 30 * 1000, // 30 seconds
      refetchInterval: 5 * 60 * 1000 // 5 minutes auto-refresh
    }
  );

export const useUserProfile = (userId?: string) =>
  useOptimizedQuery(
    [`/api/users/public/${userId}`],
    { enabled: !!userId },
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

export const usePersonalPortfolio = () =>
  useOptimizedQuery(
    ["/api/portfolio/personal"],
    {},
    { 
      staleTime: 30 * 1000, // 30 seconds
      refetchInterval: 30 * 1000 // 30 seconds for real-time updates
    }
  );