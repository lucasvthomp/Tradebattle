// Preload critical data for faster navigation
import { queryClient } from './queryClient';

export const preloadCriticalData = async (user: any) => {
  if (!user) return;

  // Preload popular stocks for dashboard
  queryClient.prefetchQuery({
    queryKey: ['/api/popular'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Preload user's tournaments
  queryClient.prefetchQuery({
    queryKey: ['/api/tournaments/user'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Preload personal portfolio
  queryClient.prefetchQuery({
    queryKey: ['/api/portfolio/personal'],
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const preloadPageData = (path: string) => {
  switch (path) {
    case '/tournaments':
      queryClient.prefetchQuery({
        queryKey: ['/api/tournaments/public'],
        staleTime: 1 * 60 * 1000, // 1 minute
      });
      break;
    
    case '/leaderboard':
      queryClient.prefetchQuery({
        queryKey: ['/api/leaderboard/tournaments'],
        staleTime: 30 * 1000, // 30 seconds
      });
      queryClient.prefetchQuery({
        queryKey: ['/api/leaderboard/personal'],
        staleTime: 30 * 1000,
      });
      break;
    
    case '/people':
      queryClient.prefetchQuery({
        queryKey: ['/api/users/public'],
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
      break;
  }
};