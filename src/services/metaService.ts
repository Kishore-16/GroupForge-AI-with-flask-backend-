// Firebase database removed - stub implementation

type MetaStats = {
  usersCount: number;
  assessedUsersCount: number;
};

export async function getMetaStats(): Promise<MetaStats> {
  console.warn('Firebase database removed - returning mock data');
  return { usersCount: 0, assessedUsersCount: 0 };
}

export async function getUserCount(): Promise<number> {
  console.warn('Firebase database removed - returning mock data');
  return 0;
}

export async function incrementUserCount(): Promise<void> {
  console.warn('Firebase database removed - operation not persisted');
}

export async function decrementUserCount(): Promise<void> {
  console.warn('Firebase database removed - operation not persisted');
}

export async function incrementAssessedUsersCount(): Promise<void> {
  console.warn('Firebase database removed - operation not persisted');
}

export async function initializeMetaIfNeeded(): Promise<void> {
  console.warn('Firebase database removed - operation not persisted');
}
