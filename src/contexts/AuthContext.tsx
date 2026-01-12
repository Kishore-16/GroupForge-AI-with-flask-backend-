// Authentication context with MongoDB Atlas and JWT
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole, StudentProfile } from '../types';
import { authApi } from '../services/authApi';

interface AuthContextType {
    currentUser: any | null;
    userProfile: User | null;
    loading: boolean;
    error: string | null;
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

// Helper to map API response to StudentProfile (Following UserPlan.md)
function mapToStudentProfile(user: any): StudentProfile {
    return {
        uid: user.id,
        email: user.email,
        displayName: user.displayName,
        role: 'student',
        institutionId: user.institutionId || '',
        profileCompleted: user.profileCompleted || false,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
        
        // Basic Profile Info
        enrollmentNumber: user.enrollmentNumber || '',
        department: user.department || '',
        major: user.major || '',
        year: user.year,
        
        // Skills & Assessment (Following UserPlan.md)
        selectedSkills: user.selectedSkills || [],
        skills: user.skills || {},
        latestAssessment: user.latestAssessment,
        
        // Profile Status Flags (Following UserPlan.md)
        attendedTest: user.attendedTest || false,
        inTeam: user.inTeam || false,
        teamId: user.teamId || null,
        
        // GitHub & Resume
        githubConnected: user.githubConnected || false,
        githubUsername: user.githubUsername || '',
        resumeUploaded: user.resumeUploaded || false,
        
        // Additional Info
        bio: user.bio || '',
        timezone: user.timezone || 'Asia/Calcutta',
        tools: user.tools || [],
        
        // Optional fields
        courses: user.courses,
        projectTopics: user.projectTopics,
        preferredGroupSize: user.preferredGroupSize,
        userSkills: user.userSkills,
        portfolioUrl: user.portfolioUrl,
        linkedinUrl: user.linkedinUrl,
        languages: user.languages,
        learningStyle: user.learningStyle,
        workStyle: user.workStyle,
        communicationPreference: user.communicationPreference,
        meetingPreference: user.meetingPreference,
        goalPreference: user.goalPreference,
        commitmentLevel: user.commitmentLevel,
        teamPreference: user.teamPreference,
        icebreakerPrompt: user.icebreakerPrompt,
        
        // Legacy compatibility
        assessmentHistory: user.assessmentHistory || [],
        teamAssignments: user.teamAssignments || [],
    };
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check for existing tokens on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (accessToken) {
                    const response = await authApi.getProfile(accessToken);
                    if (response.success && response.user) {
                        setCurrentUser({
                            uid: response.user.id,
                            email: response.user.email,
                            displayName: response.user.displayName
                        });

                        // Map based on role
                        if (response.user.role === 'student') {
                            setUserProfile(mapToStudentProfile(response.user));
                        } else {
                            setUserProfile({
                                ...response.user,
                                uid: response.user.id,
                                email: response.user.email,
                                displayName: response.user.displayName,
                                role: response.user.role as UserRole,
                                profileCompleted: response.user.profileCompleted || false,
                                createdAt: new Date(response.user.createdAt),
                                updatedAt: new Date(response.user.updatedAt)
                            } as any);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to restore auth:', err);
                // Clear invalid tokens
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    async function signInWithGoogle() {
        setError('Google authentication is not yet implemented');
        throw new Error('Google authentication is not yet implemented');
    }

    async function signInWithGitHub() {
        setError('GitHub authentication is not yet implemented');
        throw new Error('GitHub authentication is not yet implemented');
    }

    async function signInWithEmail(email: string, password: string) {
        try {
            setError(null);
            setLoading(true);

            const response = await authApi.login({ email, password });

            if (!response.success || !response.user || !response.accessToken) {
                throw new Error(response.message || 'Login failed');
            }

            // Store tokens
            localStorage.setItem('accessToken', response.accessToken);
            if (response.refreshToken) {
                localStorage.setItem('refreshToken', response.refreshToken);
            }

            // Set user state
            setCurrentUser({
                uid: response.user.id,
                email: response.user.email,
                displayName: response.user.displayName
            });

            // Map profile based on role (Following UserPlan.md)
            if (response.user.role === 'student') {
                setUserProfile(mapToStudentProfile(response.user));
            } else {
                setUserProfile({
                    ...response.user,
                    uid: response.user.id,
                    email: response.user.email,
                    displayName: response.user.displayName,
                    role: response.user.role as UserRole,
                    profileCompleted: response.user.profileCompleted || false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                } as any);
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Login failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    async function signUpWithEmail(
        email: string,
        password: string,
        role: UserRole,
        displayName: string
    ) {
        try {
            setError(null);
            setLoading(true);

            const response = await authApi.signup({
                email,
                password,
                displayName,
                role
            });

            if (!response.success || !response.user || !response.accessToken) {
                throw new Error(response.message || 'Sign up failed');
            }

            // Store tokens
            localStorage.setItem('accessToken', response.accessToken);
            if (response.refreshToken) {
                localStorage.setItem('refreshToken', response.refreshToken);
            }

            // Set user state
            setCurrentUser({
                uid: response.user.id,
                email: response.user.email,
                displayName: response.user.displayName
            });

            // Create initial profile based on role (Following UserPlan.md)
            if (role === 'student') {
                const initialStudentProfile: StudentProfile = {
                    uid: response.user.id,
                    email: response.user.email,
                    displayName: response.user.displayName,
                    role: 'student',
                    institutionId: '',
                    profileCompleted: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    enrollmentNumber: '',
                    department: '',
                    major: '',
                    selectedSkills: [],
                    skills: {},
                    attendedTest: false,
                    inTeam: false,
                    teamId: null,
                    githubConnected: false,
                    githubUsername: '',
                    resumeUploaded: false,
                    bio: '',
                    timezone: 'Asia/Calcutta',
                    tools: [],
                    assessmentHistory: [],
                    teamAssignments: [],
                };
                setUserProfile(initialStudentProfile);
            } else {
                setUserProfile({
                    uid: response.user.id,
                    email: response.user.email,
                    displayName: response.user.displayName,
                    role: role as UserRole,
                    institutionId: '',
                    profileCompleted: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as any);
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Sign up failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    async function logout() {
        try {
            // Clear tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            // Clear user state
            setCurrentUser(null);
            setUserProfile(null);
            setError(null);
        } catch (err: any) {
            console.error('Logout error:', err);
        }
    }

    async function resetPassword(_email: string) {
        setError('Password reset is not yet implemented');
        throw new Error('Password reset is not yet implemented');
    }

    async function refreshUserProfile() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('No access token found');
            }

            const response = await authApi.getProfile(accessToken);
            if (response.success && response.user) {
                // Map based on role (Following UserPlan.md)
                if (response.user.role === 'student') {
                    setUserProfile(mapToStudentProfile(response.user));
                } else {
                    setUserProfile({
                        ...response.user,
                        uid: response.user.id,
                        email: response.user.email,
                        displayName: response.user.displayName,
                        role: response.user.role as UserRole,
                        profileCompleted: response.user.profileCompleted || false,
                        createdAt: new Date(response.user.createdAt),
                        updatedAt: new Date(response.user.updatedAt)
                    } as any);
                }
            }
        } catch (err: any) {
            console.error('Failed to refresh profile:', err);
            if (err.message === 'Unauthorized') {
                await logout();
            }
        }
    }

    const value: AuthContextType = {
        currentUser,
        userProfile,
        loading,
        error,
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
