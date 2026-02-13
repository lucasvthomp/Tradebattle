import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'celebration' | 'urgent';
  effect: 'none' | 'confetti' | 'poop' | 'snow' | 'fireworks' | 'sparkles';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export function useAnnouncements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dismissedIds, setDismissedIds] = useState<number[]>(() => {
    const stored = localStorage.getItem('dismissedAnnouncements');
    return stored ? JSON.parse(stored) : [];
  });

  // Fetch active announcements
  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ['/api/announcements/active'],
    enabled: !!user,
    queryFn: async () => {
      const response = await apiRequest("GET", '/api/announcements/active');
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });

  // Filter out dismissed announcements
  const activeAnnouncements = announcements.filter(a => !dismissedIds.includes(a.id));

  const dismissAnnouncement = (id: number) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
  };

  return {
    announcements: activeAnnouncements,
    dismissAnnouncement,
  };
}
