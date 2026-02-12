/**
 * User online status types
 * - online: Active within the last 2 minutes (green circle)
 * - away: Inactive for 2-5 minutes (moon icon)
 * - offline: Inactive for 5+ minutes (grey circle)
 */
export type UserStatus = 'online' | 'away' | 'offline';

/**
 * Calculate user online status based on their last activity timestamp
 * @param lastActivity - User's last activity timestamp
 * @returns UserStatus - 'online', 'away', or 'offline'
 */
export function calculateUserStatus(lastActivity: Date | null): UserStatus {
  if (!lastActivity) return 'offline';

  const now = Date.now();
  const lastActivityTime = new Date(lastActivity).getTime();
  const diffMinutes = (now - lastActivityTime) / (1000 * 60);

  if (diffMinutes < 2) return 'online';
  if (diffMinutes < 5) return 'away';
  return 'offline';
}

/**
 * Add status field to user objects
 * @param users - Array of user objects with lastActivity field
 * @returns Users with calculated status field
 */
export function addUserStatuses<T extends { lastActivity?: Date | null }>(users: T[]): (T & { status: UserStatus })[] {
  return users.map(user => ({
    ...user,
    status: calculateUserStatus(user.lastActivity || null)
  }));
}
