import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusIndicator, UserStatus, calculateUserStatus } from "@/components/ui/status-indicator";

interface AvatarWithStatusProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  lastActivity?: Date | string | null;
  status?: UserStatus;
  className?: string;
  statusSize?: 'sm' | 'md' | 'lg';
}

/**
 * Avatar component with online status indicator overlay
 * Shows green circle, moon, or grey circle at bottom-right based on user's last activity
 */
export function AvatarWithStatus({
  src,
  alt,
  fallback,
  lastActivity,
  status,
  className = '',
  statusSize = 'md'
}: AvatarWithStatusProps) {
  // Calculate status from lastActivity if not explicitly provided
  const userStatus = status || calculateUserStatus(lastActivity || null);

  return (
    <div className={`relative inline-block ${className}`}>
      <Avatar className="w-full h-full">
        <AvatarImage src={src || undefined} alt={alt} />
        <AvatarFallback>{fallback || alt?.[0]?.toUpperCase() || '?'}</AvatarFallback>
      </Avatar>

      {/* Status indicator positioned at bottom-right */}
      <div className="absolute bottom-0 right-0 translate-x-[15%] translate-y-[15%]">
        <div
          className="rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1E2D3F', padding: '2px' }}
        >
          <StatusIndicator status={userStatus} size={statusSize} />
        </div>
      </div>
    </div>
  );
}
