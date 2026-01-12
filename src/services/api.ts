const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

export class ApiError extends Error {
    status: number;
    body: unknown;

    constructor(message: string, status: number, body: unknown) {
        super(message);
        this.status = status;
        this.body = body;
    }
}

// Helper to get JWT token from localStorage
export function getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
}

function buildHeaders(init?: RequestInit): HeadersInit {
    // Preserve caller-provided headers (e.g., for FormData) and add JSON defaults when appropriate.
    const hasContentType = init?.headers && 'Content-Type' in (init.headers as any);
    const baseHeaders: HeadersInit = hasContentType ? (init!.headers as HeadersInit) :
        (init?.body && init.body instanceof FormData) ? (init.headers ?? {}) :
            { 'Content-Type': 'application/json', ...(init?.headers ?? {}) };

    // Add Authorization header if token exists
    const token = getAuthToken();
    if (token) {
        return {
            ...baseHeaders,
            'Authorization': `Bearer ${token}`
        };
    }

    return baseHeaders;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: buildHeaders(init),
    });

    let data: unknown = null;
    try {
        data = await response.json();
    } catch (err) {
        data = null;
    }

    if (!response.ok) {
        throw new ApiError(`API request failed: ${response.status}`, response.status, data);
    }

    return data as T;
}

// Teams API
export interface TeamResponse {
    id: string;
    name: string;
    members: Array<{
        userId: string;
        displayName: string;
        email?: string;
        role: string;
    }>;
    status: 'active' | 'completed' | 'draft' | 'archived';
    createdAt: string;
    createdBy: string;
}

export async function fetchAllTeams(): Promise<TeamResponse[]> {
    try {
        const response = await apiFetch<{ success: boolean; data: TeamResponse[] }>('/teams', {
            method: 'GET'
        });
        return response.data || [];
    } catch (error) {
        console.error('Error fetching teams:', error);
        return [];
    }
}

export async function fetchEligibleStudents(): Promise<any[]> {
    try {
        const response = await apiFetch<{ success: boolean; data: any[]; count: number }>('/teams/eligible-students', {
            method: 'GET'
        });
        return response.data || [];
    } catch (error) {
        console.error('Error fetching eligible students:', error);
        return [];
    }
}
