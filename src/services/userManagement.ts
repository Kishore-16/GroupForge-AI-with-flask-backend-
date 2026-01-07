// Firebase database removed - stub implementation

/**
 * Delete a user from the database and decrement the user count
 * @param userId - The UID of the user to delete
 */
export async function deleteUserAndUpdateCount(userId: string): Promise<void> {
    console.warn(`Firebase database removed - user ${userId} deletion not persisted`);
}

/**
 * Delete multiple users and update the count accordingly
 * @param userIds - Array of user UIDs to delete
 */
export async function deleteMultipleUsersAndUpdateCount(userIds: string[]): Promise<void> {
    console.warn(`Firebase database removed - ${userIds.length} user deletions not persisted`);
}

export interface SkillStatus {
    userId: string;
    skillVersion: string | null;
    updatedAt?: string;
    stale?: boolean;
    pendingJobId?: string;
}

/**
 * Fetch latest skill status for a user from Flask API.
 */
export async function getUserSkillStatus(userId: string): Promise<SkillStatus> {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
    const res = await fetch(`${API_BASE_URL}/users/${userId}/skill-status`);
    if (!res.ok) {
        throw new Error(`Failed to fetch skill status (${res.status})`);
    }
    return res.json();
}
