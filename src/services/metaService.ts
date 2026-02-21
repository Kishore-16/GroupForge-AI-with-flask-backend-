import { apiFetch } from './api';

type MetaStats = {
  usersCount: number;
  assessedUsersCount: number;
};

export async function getMetaStats(): Promise<MetaStats> {
  try {
    const response = await apiFetch<{ success: boolean; data: { totalStudents: number; assessedStudents: number } }>('/users/stats', {
      method: 'GET'
    });

    return {
      usersCount: response.data.totalStudents,
      assessedUsersCount: response.data.assessedStudents
    };
  } catch (error) {
    console.error('Error fetching meta stats:', error);
    return { usersCount: 0, assessedUsersCount: 0 };
  }
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
