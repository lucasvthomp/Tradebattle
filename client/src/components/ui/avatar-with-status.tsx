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
        border: `${borderWidth} solid #67E7BF`,
        borderRadius: borderRadius,
        overflow: 'visible'
      } : undefined}
    >
      <Avatar className="w-full h-full" style={{ borderRadius: borderRadius }}>
        <AvatarImage
          src={src || "/assets/tradebattle-default-broker-v2.png"}
          alt={alt || "Tradebattle player"}
          className="object-cover"
        />
        <AvatarFallback style={{ borderRadius: borderRadius, backgroundColor: '#2d1958' }}>
          <img
            src="/assets/tradebattle-default-broker-v2.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        </AvatarFallback>
      </Avatar>

      {/* Presence sits on the lower edge of the square avatar so it never collides with a card header. */}
      <div className="tradebattle-avatar-status absolute bottom-0 right-0 z-10" style={{ transform: 'translate(24%, 24%)' }}>
        <div
          className="rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#140b2b', padding: '3px', border: '1px solid rgba(243,198,91,.35)' }}
        >
          <StatusIndicator status={userStatus} size={statusSize} />
        </div>
      </div>
    </div>
  );
}
