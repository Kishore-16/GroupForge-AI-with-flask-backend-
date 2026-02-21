/**
 * Authentication API Service
 * Handles all communication with the backend authentication endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

export interface SignupRequest {
    email: string;
    password: string;
    displayName: string;
    role: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user?: {
        id: string;
        email: string;
        displayName: string;
        role: string;
        profileCompleted?: boolean;
    };
    accessToken?: string;
    refreshToken?: string;
}

export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    role: string;
    profileCompleted: boolean;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
}

class AuthApi {
    /**
     * Register a new user
     */
    async signup(data: SignupRequest): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Sign up failed');
        }

        return response.json();
    }

    /**
     * Login a user
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        return response.json();
    }

    /**
     * Get current user profile (requires auth token)
     */
    async getProfile(accessToken: string): Promise<{ success: boolean; user: UserProfile }> {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch profile');
        }

        return response.json();
    }

    /**
     * Update user profile (requires auth token)
     */
    async updateProfile(accessToken: string, data: Record<string, any>): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update profile');
        }

        return response.json();
    }

    /**
     * Refresh access token (requires refresh token)
     */
    async refreshToken(refreshToken: string): Promise<{ success: boolean; accessToken: string }> {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${refreshToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to refresh token');
        }

        return response.json();
    }

    /**
     * Update user by ID (requires auth token)
     */
    async updateUserProfile(userId: string, accessToken: string, data: Record<string, any>): Promise<{ success: boolean; message: string }> {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update user profile');
        }

        return response.json();
    }
}

export const authApi = new AuthApi();
