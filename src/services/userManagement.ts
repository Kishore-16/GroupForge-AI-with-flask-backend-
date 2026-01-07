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
