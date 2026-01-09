// Team types for group formation - Following UserPlan.md specification

// Team member inside team document (Following UserPlan.md)
export interface TeamMemberRef {
    studentId: string;
    role: TeamRole;
    joinedAt: Date | string;
}

// Team schema - Source of Truth (Following UserPlan.md)
export interface Team {
    id: string;
    members: TeamMemberRef[];
    teamSkillVector: TeamSkillVector; // Aggregated skill scores
    status: 'active' | 'needs_rebalance' | 'completed' | 'archived';
    createdBy: string; // Faculty UID
    createdAt: Date | string;
    
    // Optional legacy/extended fields
    name?: string;
    courseId?: string;
    projectId?: string;
    formationMethod?: 'ai_generated' | 'manual' | 'hybrid';
    balanceScore?: number; // 0-100, how balanced the team is
    aiRationale?: string;
}

// Team skill vector - aggregated from member skills
export interface TeamSkillVector {
    [skillName: string]: number; // Average skill scores
}

// Extended team member with full profile info (for UI display)
export interface TeamMember {
    userId: string;
    displayName: string;
    role: TeamRole;
    skillSnapshot: SkillSummary;
    joinedAt: Date | string;
    contributionScore?: number;
    email?: string;
    githubUsername?: string;
}

export type TeamRole =
    | 'leader'
    | 'coordinator'
    | 'contributor'
    | 'specialist'
    | 'developer'
    | 'researcher';

export interface SkillSummary {
    [skillName: string]: number;
}

// Team formation configuration
export interface TeamFormationConfig {
    courseId?: string;
    minTeamSize: number;
    maxTeamSize: number;
    optimizationGoals: OptimizationGoal[];
    constraints: FormationConstraint[];
    allowManualOverride: boolean;
}

export type OptimizationGoal =
    | 'balance_skills'
    | 'maximize_diversity'
    | 'ensure_leadership'
    | 'mix_experience_levels';

export interface FormationConstraint {
    type: 'must_include' | 'must_exclude' | 'prefer_together' | 'prefer_apart';
    studentIds: string[];
    reason?: string;
}

// Team formation result
export interface TeamFormationResult {
    teams: Team[];
    unassignedStudents: string[];
    overallBalanceScore: number;
    formationInsights: string;
    alternativeConfigurations?: Team[][];
}

// Eligibility check result for team formation
export interface EligibilityResult {
    eligible: boolean;
    reason?: string;
    missingRequirements?: ('profile' | 'assessment')[];
}

// Helper function to check student eligibility
export function checkStudentEligibility(student: {
    profileCompleted: boolean;
    attendedTest: boolean;
    inTeam: boolean;
}): EligibilityResult {
    if (!student.profileCompleted) {
        return {
            eligible: false,
            reason: 'Profile not completed',
            missingRequirements: ['profile'],
        };
    }
    if (!student.attendedTest) {
        return {
            eligible: false,
            reason: 'Assessment not taken',
            missingRequirements: ['assessment'],
        };
    }
    if (student.inTeam) {
        return {
            eligible: false,
            reason: 'Already assigned to a team',
        };
    }
    return { eligible: true };
}
