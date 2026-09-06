import { useEffect, useState } from "react";
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

const defaultAvatar = "/assets/tradebattle-default-broker-v2.png";

/**
 * Shared profile image treatment used across cards, profiles, chat, and rankings.
 * A missing or broken image always resolves to the same neutral broker mark.
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
  const [imageSrc, setImageSrc] = useState(src || defaultAvatar);
  const userStatus = status || calculateUserStatus(lastActivity || null);

  useEffect(() => {
    setImageSrc(src || defaultAvatar);
  }, [src]);

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
        borderRadius,
        overflow: 'visible'
      } : undefined}
    >
      <Avatar className="w-full h-full" style={{ borderRadius }}>
        <AvatarImage
          src={imageSrc}
          alt={alt}
          className="object-cover"
          onError={() => {
            if (imageSrc !== defaultAvatar) setImageSrc(defaultAvatar);
          }}
        />
        <AvatarFallback style={{ borderRadius, backgroundColor: '#0B1B2A' }}>
          <img src={defaultAvatar} alt={fallback || ""} className="w-full h-full object-cover" />
        </AvatarFallback>
      </Avatar>

      <div className="tradebattle-avatar-status absolute top-0 right-0 z-10" style={{ transform: 'translate(24%, -24%)' }}>
        <div
          className="rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#071522', padding: '3px', border: '1px solid rgba(103,231,191,.22)' }}
          aria-label={`Status: ${userStatus}`}
        >
          <StatusIndicator status={userStatus} size={statusSize} />
        </div>
      </div>
    </div>
  );
}
