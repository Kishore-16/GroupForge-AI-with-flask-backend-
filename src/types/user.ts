// User types and interfaces for GroupForge AI - Following UserPlan.md specification

export type UserRole = 'student' | 'faculty' | 'admin';

// Skill level options
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

// Learning style options
export type LearningStyle = 'visual' | 'auditory' | 'reading' | 'kinesthetic';

// Work style options
export type WorkStyle = 'planner' | 'flexible' | 'mixed';

// Communication preference options
export type CommunicationPreference = 'chat' | 'voice' | 'video' | 'in-person';

// Meeting preference options
export type MeetingPreference = 'online' | 'in-person' | 'hybrid';

// Goal preference options
export type GoalPreference = 'grade' | 'learning' | 'speed' | 'balanced';

// Commitment level options
export type CommitmentLevel = 'low' | 'medium' | 'high';

// Team preference options
export type TeamPreference = 'mixed-skills' | 'similar-skills' | 'no-preference';

// Availability time slots
export interface TimeSlot {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
}

// User skill with level (for self-reported skills before assessment)
export interface UserSkill {
    name: string;
    level: SkillLevel;
}

// Skill scores after assessment (skill name -> score 0-100)
export interface SkillScores {
    [skillName: string]: number;
}

// Latest assessment record (Following UserPlan.md)
export interface LatestAssessment {
    score: number;
    takenAt: Date | string;
}

// Base user interface
export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    institutionId: string;
    profileCompleted: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

// Student profile following UserPlan.md specification
export interface StudentProfile extends User {
    role: 'student';

    // Basic Profile Info
    enrollmentNumber: string;
    department: string;
    major: string;
    year?: number;

    // Skills & Assessment (Following UserPlan.md)
    selectedSkills: string[]; // Skills selected by user (e.g., ['python', 'ml', 'frontend', 'sql'])
    skills: SkillScores; // Skill scores after assessment (e.g., { python: 72, ml: 65 })
    latestAssessment?: LatestAssessment; // Latest assessment result

    // Profile Status Flags (Following UserPlan.md)
    attendedTest: boolean; // Has completed assessment
    inTeam: boolean; // Is assigned to a team
    teamId: string | null; // Reference to team document

    // GitHub & Resume
    githubConnected: boolean;
    githubUsername: string;
    resumeUploaded: boolean;

    // Additional Info
    bio: string;
    timezone: string;
    tools: string[]; // Tools user is familiar with

    // Optional Extended Info
    courses?: string[];
    projectTopics?: string[];
    preferredGroupSize?: number;
    availability?: TimeSlot[];
    userSkills?: UserSkill[]; // Self-reported skill levels
    portfolioUrl?: string;
    linkedinUrl?: string;
    languages?: string[];

    // Work & Learning Style (Optional)
    learningStyle?: LearningStyle;
    workStyle?: WorkStyle;
    communicationPreference?: CommunicationPreference;
    meetingPreference?: MeetingPreference;

    // Goals & Preferences (Optional)
    goalPreference?: GoalPreference;
    commitmentLevel?: CommitmentLevel;
    teamPreference?: TeamPreference;

    // Optional Info
    icebreakerPrompt?: string;

    // Legacy compatibility
    assessmentHistory?: any[]; // For backward compatibility
    teamAssignments?: string[]; // Legacy - use teamId instead
}

// Faculty profile
export interface FacultyProfile extends User {
    role: 'faculty';
    designation?: 'Assistant Professor' | 'Associate Professor' | 'Professor';
    department?: string;
    employeeId?: string;
    contactNumber?: string;
    coursesManaged: string[]; // Course IDs
}

// Admin profile
export interface AdminProfile extends User {
    role: 'admin';
    permissions: AdminPermission[];
}

export type AdminPermission =
    | 'manage_users'
    | 'manage_courses'
    | 'manage_institutions'
    | 'view_analytics'
    | 'configure_assessments';

// Type guard functions
export function isStudentProfile(user: User | null): user is StudentProfile {
    return user?.role === 'student';
}

export function isFacultyProfile(user: User | null): user is FacultyProfile {
    return user?.role === 'faculty';
}

export function isAdminProfile(user: User | null): user is AdminProfile {
    return user?.role === 'admin';
}

// Helper to check if student can take assessment
export function canTakeAssessment(profile: StudentProfile): boolean {
    return profile.profileCompleted && profile.selectedSkills.length > 0;
}

// Helper to check if student is eligible for team formation
export function isEligibleForTeam(profile: StudentProfile): boolean {
    return profile.profileCompleted && profile.attendedTest && !profile.inTeam;
}

// Helper to get completion status
export interface ProfileCompletionStatus {
    profileCompleted: boolean;
    assessmentCompleted: boolean;
    inTeam: boolean;
    nextStep: 'complete-profile' | 'take-assessment' | 'wait-for-team' | 'view-team';
}

export function getProfileCompletionStatus(profile: StudentProfile): ProfileCompletionStatus {
    const { profileCompleted, attendedTest, inTeam } = profile;
    const assessmentCompleted = attendedTest;

    let nextStep: ProfileCompletionStatus['nextStep'];
    if (!profileCompleted) {
        nextStep = 'complete-profile';
    } else if (!assessmentCompleted) {
        nextStep = 'take-assessment';
    } else if (!inTeam) {
        nextStep = 'wait-for-team';
    } else {
        nextStep = 'view-team';
    }

    return {
        profileCompleted,
        assessmentCompleted,
        inTeam,
        nextStep,
    };
}
