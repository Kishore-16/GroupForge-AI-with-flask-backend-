// Authentication context - Firebase removed
import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
    currentUser: any | null;
    userProfile: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithGitHub: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, role: UserRole, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    // Mock user for development - authentication temporarily disabled
    const [currentUser] = useState<any | null>({
        uid: 'mock-user-id',
        email: 'demo@example.com',
        displayName: 'Demo User'
    });
    const [userProfile] = useState<User | null>({
        uid: 'mock-user-id',
        email: 'demo@example.com',
        displayName: 'Demo User',
        role: 'student', // Change to 'faculty' or 'admin' as needed
        institutionId: 'demo-institution',
        profileCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        skills: {
            leadership: { score: 75, confidence: 'medium', assessmentCount: 1 },
            analyticalThinking: { score: 80, confidence: 'high', assessmentCount: 1 },
            creativity: { score: 70, confidence: 'medium', assessmentCount: 1 },
            executionStrength: { score: 85, confidence: 'high', assessmentCount: 1 },
            communication: { score: 78, confidence: 'medium', assessmentCount: 1 },
            teamwork: { score: 82, confidence: 'high', assessmentCount: 1 },
            lastAssessedAt: new Date(),
            overallConfidence: 'medium'
        },
        assessmentHistory: [],
        githubConnected: false,
        resumeUploaded: false,
        teamAssignments: []
    } as any);
    const [loading] = useState(false);

    // Stub functions - Firebase authentication removed
    async function signInWithGoogle() {
        console.warn('Firebase authentication has been removed from this project');
        throw new Error('Authentication not available');
    }

    async function signInWithGitHub() {
        console.warn('Firebase authentication has been removed from this project');
        throw new Error('Authentication not available');
    }

    async function signInWithEmail(_email: string, _password: string) {
        console.warn('Firebase authentication has been removed from this project');
        throw new Error('Authentication not available');
    }

    async function signUpWithEmail(
        _email: string,
        _password: string,
        _role: UserRole,
        _displayName: string
    ) {
        console.warn('Firebase authentication has been removed from this project');
        throw new Error('Authentication not available');
    }

    async function logout() {
        console.warn('Firebase authentication has been removed from this project');
    }

    async function resetPassword(_email: string) {
        console.warn('Firebase authentication has been removed from this project');
        throw new Error('Authentication not available');
    }

    async function refreshUserProfile() {
        console.warn('Firebase authentication has been removed from this project');
    }

    const value: AuthContextType = {
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithGitHub,
        signInWithEmail,
        signUpWithEmail,
        logout,
        resetPassword,
        refreshUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
