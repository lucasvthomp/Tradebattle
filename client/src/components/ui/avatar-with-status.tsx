import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusIndicator, UserStatus, calculateUserStatus } from "@/components/ui/status-indicator";
import { UserCircle } from "lucide-react";

interface AvatarWithStatusProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  lastActivity?: Date | string | null;
  status?: UserStatus;
  className?: string;
  statusSize?: 'sm' | 'md' | 'lg';
  showBorder?: boolean;
}

/**
 * Avatar component with online status indicator overlay
 * Shows green circle, moon, or grey circle at bottom-right based on user's last activity
 * Now displays as perfect square with matching border radius
 */
export function AvatarWithStatus({
  src,
  alt,
  fallback,
  lastActivity,
  status,
  className = '',
  statusSize = 'md',
  showBorder = false
}: AvatarWithStatusProps) {
  // Calculate status from lastActivity if not explicitly provided
  const userStatus = status || calculateUserStatus(lastActivity || null);

  // Determine border size based on avatar size
  const borderWidth = className.includes('w-32') ? '4px' :
                     className.includes('w-24') ? '3px' :
                     className.includes('w-16') ? '2px' : '2px';

  const borderRadius = className.includes('w-32') ? '16px' :
                      className.includes('w-24') ? '12px' :
                      className.includes('w-16') ? '8px' : '8px';

  return (
    <div
      className={`relative inline-block ${className}`}
      style={showBorder ? {
        border: `${borderWidth} solid #00A3FF`,
        borderRadius: borderRadius,
        overflow: 'hidden'
      } : undefined}
    >
      <Avatar className="w-full h-full" style={{ borderRadius: borderRadius }}>
        <AvatarImage src={src || undefined} alt={alt} className="object-cover" />
        <AvatarFallback style={{ borderRadius: borderRadius, backgroundColor: '#0C1829' }}>
          <UserCircle className="w-1/2 h-1/2" style={{ color: '#4B5563' }} />
        </AvatarFallback>
      </Avatar>

      {/* Status indicator positioned at bottom-right, on top of frame and picture */}
      <div className="absolute bottom-0 right-0 z-10" style={{ transform: 'translate(15%, 15%)' }}>
        <div
          className="rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#0C1829', padding: '2px' }}
        >
          <StatusIndicator status={userStatus} size={statusSize} />
        </div>
      </div>
    </div>
  );
}
