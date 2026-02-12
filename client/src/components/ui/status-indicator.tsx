import { Moon } from "lucide-react";

export type UserStatus = 'online' | 'away' | 'offline';

interface StatusIndicatorProps {
  status: UserStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Status indicator component for displaying user online status
 * - online: Green circle (active within 2 minutes)
 * - away: Moon icon (inactive 2-5 minutes)
 * - offline: Grey circle (inactive 5+ minutes)
 */
export function StatusIndicator({ status, size = 'md', className = '' }: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const iconSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  if (status === 'online') {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full ${className}`}
        style={{ backgroundColor: '#28C76F' }}
        title="Online"
      />
    );
  }

  if (status === 'away') {
    return (
      <div
        className={`${sizeClasses[size]} flex items-center justify-center ${className}`}
        title="Away"
      >
        <Moon className={iconSizeClasses[size]} style={{ color: '#8A93A6' }} />
      </div>
    );
  }

  // offline
  return (
    <div
      className={`${sizeClasses[size]} rounded-full ${className}`}
      style={{ backgroundColor: '#5f6b7a' }}
      title="Offline"
    />
  );
}

/**
 * Calculate user status from lastActivity timestamp
 */
export function calculateUserStatus(lastActivity: Date | string | null): UserStatus {
  if (!lastActivity) return 'offline';

  const now = Date.now();
  const lastActivityTime = new Date(lastActivity).getTime();
  const diffMinutes = (now - lastActivityTime) / (1000 * 60);

  if (diffMinutes < 2) return 'online';
  if (diffMinutes < 5) return 'away';
  return 'offline';
}
