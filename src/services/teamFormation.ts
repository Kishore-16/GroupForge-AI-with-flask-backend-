// Team formation service - Firebase database removed
import {
    Team,
    TeamFormationConfig,
    TeamFormationResult,
    SkillSummary
} from '../types';
import { teamFormationModel } from '../config/gemini';
import { apiFetch } from './api';

export type TeamFormationStrategy = 'balanced' | 'complementary' | 'role-based';

interface StudentWithSkills {
    uid: string;
    displayName: string;
    skills: SkillSummary;
}

// Fetch all students enrolled in a course with their skills
export async function getStudentsForCourse(_courseId: string): Promise<StudentWithSkills[]> {
    // For now, just return all eligible students regardless of course
    // You can add courseId filtering in the backend later if needed
    return await getAllStudentsWithAssessments();
}

// Calculate team balance score (0-100)
function calculateTeamBalance(members: StudentWithSkills[]): number {
    if (members.length === 0) return 0;

    const skills: (keyof SkillSummary)[] = ['leadership', 'analyticalThinking', 'creativity', 'executionStrength'];

    // Calculate average and variance for each skill
    let totalVariance = 0;
    let hasLeader = false;

    for (const skill of skills) {
        const scores = members.map(m => m.skills[skill]);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
        totalVariance += variance;

        if (skill === 'leadership' && Math.max(...scores) >= 70) {
            hasLeader = true;
        }
    }

    // Lower variance = higher balance
    const balanceFromVariance = Math.max(0, 100 - (totalVariance / skills.length) / 10);

    // Bonus for having a leader
    const leaderBonus = hasLeader ? 10 : 0;

    return Math.min(100, balanceFromVariance + leaderBonus);
}

// Basic algorithm: Greedy balanced team formation
function greedyTeamFormation(
    students: StudentWithSkills[],
    config: TeamFormationConfig
): Team[] {
    const { minTeamSize: _minTeamSize, maxTeamSize } = config;
    const numStudents = students.length;
    const numTeams = Math.ceil(numStudents / maxTeamSize);

    // Sort students by leadership (descending) to distribute leaders first
    const sortedStudents = [...students].sort(
        (a, b) => b.skills.leadership - a.skills.leadership
    );

    const teams: Team[] = [];
    const assignedStudents = new Set<string>();

    // Initialize empty teams
    for (let i = 0; i < numTeams; i++) {
        teams.push({
            id: `team_${Date.now()}_${i}`,
            name: `Team ${i + 1}`,
            courseId: config.courseId,
            members: [],
            formationMethod: 'ai_generated',
            createdAt: new Date(),
            createdBy: '',
            status: 'active',
            balanceScore: 0,
            teamSkillVector: {}
        });
    }

    // Distribute leaders first (one per team)
    for (let i = 0; i < Math.min(numTeams, sortedStudents.length); i++) {
        const student = sortedStudents[i];
        teams[i].members.push({
            studentId: student.uid,
            role: 'leader',
            joinedAt: new Date(),
        });
        assignedStudents.add(student.uid);
    }

    // Assign remaining students to teams with lowest current skill coverage
    const remainingStudents = sortedStudents.filter(s => !assignedStudents.has(s.uid));

    for (const student of remainingStudents) {
        // Find team that would benefit most from this student
        let bestTeamIndex = 0;
        let bestImprovement = -Infinity;

        for (let i = 0; i < teams.length; i++) {
            if (teams[i].members.length >= maxTeamSize) continue;

            const currentMembers = teams[i].members.map(m => {
                const st = students.find(s => s.uid === m.studentId);
                return st ? { uid: st.uid, displayName: st.displayName, skills: st.skills } : null;
            }).filter(Boolean) as StudentWithSkills[];

            const withNewMember = [...currentMembers, student];
            const improvement = calculateTeamBalance(withNewMember) - calculateTeamBalance(currentMembers);

            if (improvement > bestImprovement) {
                bestImprovement = improvement;
                bestTeamIndex = i;
            }
        }

        teams[bestTeamIndex].members.push({
            studentId: student.uid,
            role: 'contributor',
            joinedAt: new Date(),
        });
    }

    // Calculate final balance scores
    for (const team of teams) {
        const membersWithSkills = team.members.map(m => {
            const st = students.find(s => s.uid === m.studentId);
            return st ? { uid: st.uid, displayName: st.displayName, skills: st.skills } : null;
        }).filter(Boolean) as StudentWithSkills[];
        team.balanceScore = calculateTeamBalance(membersWithSkills);
    }

    return teams;
}

// AI-enhanced team formation using Gemini
export async function formTeamsWithAI(
    config: TeamFormationConfig,
    facultyId: string
): Promise<TeamFormationResult> {
    const students = await getStudentsForCourse(config.courseId || 'default');

    if (students.length < config.minTeamSize) {
        throw new Error('Not enough students to form teams');
    }

    // First, use greedy algorithm for initial formation
    const initialTeams = greedyTeamFormation(students, config);

    // Then, use Gemini to analyze and suggest improvements
    const prompt = `You are an expert in team dynamics and group formation for academic projects.

Current team configuration:
${JSON.stringify(initialTeams.map(t => ({
        name: t.name,
        members: t.members.map(m => {
            const st = students.find(s => s.uid === m.studentId);
            return st ? { name: st.displayName, skills: st.skills } : { name: 'Unknown', skills: {} };
        }),
        balanceScore: t.balanceScore,
    })), null, 2)}

Optimization goals: ${config.optimizationGoals.join(', ')}
Min team size: ${config.minTeamSize}
Max team size: ${config.maxTeamSize}

Analyze these teams and provide:
1. Overall assessment of the formation quality
2. Specific swap recommendations to improve balance (if any)
3. Rationale for each team composition

Return a JSON object:
{
  "overallScore": 85,
  "insights": "Summary of team formation quality",
  "swapRecommendations": [
    { "from": "Team 1", "to": "Team 2", "student": "name", "reason": "why" }
  ],
  "teamRationales": {
    "Team 1": "Why this team composition works",
    "Team 2": "..."
  }
}

Return ONLY the JSON object.`;

    try {
        const result = await teamFormationModel.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const aiAnalysis = JSON.parse(jsonMatch[0]);

            // Apply swap recommendations if beneficial
            // For now, just attach the AI rationale
            for (const team of initialTeams) {
                const teamName = team.name || `Team ${initialTeams.indexOf(team) + 1}`;
                team.aiRationale = aiAnalysis.teamRationales?.[teamName] || '';
                team.createdBy = facultyId;
            }

            return {
                teams: initialTeams,
                unassignedStudents: [],
                overallBalanceScore: aiAnalysis.overallScore ||
                    initialTeams.reduce((sum, t) => sum + (t.balanceScore || 0), 0) / initialTeams.length,
                formationInsights: aiAnalysis.insights || 'Teams formed using AI-assisted matching.',
            };
        }
    } catch (error) {
        console.error('AI analysis failed, using base algorithm:', error);
    }

    // Fallback to basic algorithm results
    return {
        teams: initialTeams,
        unassignedStudents: [],
        overallBalanceScore: initialTeams.reduce((sum, t) => sum + (t.balanceScore || 0), 0) / initialTeams.length,
        formationInsights: 'Teams formed using balanced skill distribution algorithm.',
    };
}

// Save teams to backend
export async function saveTeams(teams: Team[]): Promise<void> {
    try {
        // Save each team to backend using apiFetch (auto-adds JWT)
        for (const team of teams) {
            const payload = {
                teamName: team.name || `Team ${teams.indexOf(team) + 1}`,
                members: team.members.map(m => ({
                    studentId: m.studentId,
                    role: m.role,
                    joinedAt: m.joinedAt
                }))
            };

            await apiFetch<{ success: boolean; message: string; data: any }>('/teams/form', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }
        console.log(`✓ Successfully saved ${teams.length} teams`);
    } catch (error) {
        console.error('Error saving teams:', error);
        throw error;
    }
}

// Get teams for a course - Firebase removed
export async function getTeamsForCourse(_courseId: string): Promise<Team[]> {
    console.warn('Firebase database removed - returning empty teams list');
    return [];
}

// Save teams - Firebase removed
export async function saveTeamsToFirestore(_teams: Team[]): Promise<void> {
    console.warn('Firebase database removed - teams not persisted');
}

// Get all students with completed assessments
async function getAllStudentsWithAssessments(): Promise<StudentWithSkills[]> {
    try {
        // Fetch eligible students from backend using apiFetch (auto-adds JWT)
        const data = await apiFetch<{ success: boolean; data: any[]; count: number }>('/teams/eligible-students');
        const eligibleStudents = data.data || [];

        console.log(`✓ Found ${eligibleStudents.length} eligible students from backend`);

        // Map backend student data to StudentWithSkills format
        return eligibleStudents.map((student: any) => {
            const backendSkills = student.skills || {};

            // Calculate average of all technical skills or use 50 as default
            const skillValues = Object.values(backendSkills).filter(v => typeof v === 'number') as number[];
            const avgSkill = skillValues.length > 0
                ? skillValues.reduce((sum, val) => sum + val, 0) / skillValues.length
                : 50;

            // For team formation, we use the technical skill scores
            // as approximations for soft skills
            return {
                uid: student.id,
                displayName: student.displayName || 'Unknown',
                skills: {
                    leadership: backendSkills.leadership || avgSkill,
                    analyticalThinking: backendSkills.analyticalThinking || backendSkills.python || avgSkill,
                    creativity: backendSkills.creativity || backendSkills.frontend || avgSkill,
                    executionStrength: backendSkills.executionStrength || backendSkills.flask || avgSkill,
                    communication: backendSkills.communication || avgSkill,
                    teamwork: backendSkills.teamwork || avgSkill
                }
            };
        });
    } catch (error) {
        console.error('Error fetching students with assessments:', error);
        return [];
    }
}

// Helper function to enrich team members with full student data for UI display
function enrichTeamMembers(teams: Team[], students: StudentWithSkills[]): Team[] {
    return teams.map(team => ({
        ...team,
        members: team.members.map((member: any) => {
            const student = students.find(s => s.uid === (member.studentId || member.userId));
            return {
                userId: member.studentId || member.userId,
                studentId: member.studentId || member.userId,
                displayName: student?.displayName || 'Unknown Student',
                role: member.role,
                skillSnapshot: student?.skills || {},
                joinedAt: member.joinedAt,
            };
        })
    }));
}

// Balanced strategy: Snake draft distribution
function balancedStrategy(students: StudentWithSkills[], teamSize: number, facultyId: string): Team[] {
    const numTeams = Math.ceil(students.length / teamSize);
    const teams: Team[] = [];

    // Sort by overall skill average (descending)
    const sortedStudents = [...students].sort((a, b) => {
        const avgA = Object.values(a.skills).reduce((sum, score) => sum + score, 0) / 4;
        const avgB = Object.values(b.skills).reduce((sum, score) => sum + score, 0) / 4;
        return avgB - avgA;
    });

    // Initialize teams
    for (let i = 0; i < numTeams; i++) {
        teams.push({
            id: `team_balanced_${Date.now()}_${i}`,
            name: `Team ${i + 1}`,
            courseId: 'default',
            members: [],
            formationMethod: 'ai_generated',
            createdAt: new Date(),
            createdBy: facultyId,
            status: 'active',
            balanceScore: 0,
            teamSkillVector: {}
        });
    }

    // Snake draft: 0,1,2,3,3,2,1,0,0,1,2,3...
    let teamIndex = 0;
    let direction = 1;

    for (const student of sortedStudents) {
        teams[teamIndex].members.push({
            studentId: student.uid,
            role: teams[teamIndex].members.length === 0 ? 'leader' : 'contributor',
            joinedAt: new Date(),
        });

        teamIndex += direction;
        if (teamIndex >= numTeams) {
            teamIndex = numTeams - 1;
            direction = -1;
        } else if (teamIndex < 0) {
            teamIndex = 0;
            direction = 1;
        }
    }

    // Calculate balance scores
    for (const team of teams) {
        const membersWithSkills = team.members.map(m => {
            const st = students.find(s => s.uid === m.studentId);
            return st ? { uid: st.uid, displayName: st.displayName, skills: st.skills } : null;
        }).filter(Boolean) as StudentWithSkills[];
        team.balanceScore = calculateTeamBalance(membersWithSkills);
    }

    return teams;
}

// Complementary strategy: One specialist from each skill area
function complementaryStrategy(students: StudentWithSkills[], teamSize: number, facultyId: string): Team[] {
    const numTeams = Math.ceil(students.length / teamSize);
    const teams: Team[] = [];

    // Initialize teams
    for (let i = 0; i < numTeams; i++) {
        teams.push({
            id: `team_complementary_${Date.now()}_${i}`,
            name: `Team ${i + 1}`,
            courseId: 'default',
            members: [],
            formationMethod: 'ai_generated',
            createdAt: new Date(),
            createdBy: facultyId,
            status: 'active',
            balanceScore: 0,
            teamSkillVector: {}
        });
    }

    // Categorize students by primary strength
    const skills: (keyof SkillSummary)[] = ['leadership', 'analyticalThinking', 'creativity', 'executionStrength'];
    const studentsByPrimarySkill: Record<string, StudentWithSkills[]> = {};

    for (const skill of skills) {
        studentsByPrimarySkill[skill] = [];
    }

    for (const student of students) {
        let maxSkill: keyof SkillSummary = 'leadership';
        let maxScore = student.skills.leadership;

        for (const skill of skills) {
            if (student.skills[skill] > maxScore) {
                maxScore = student.skills[skill];
                maxSkill = skill;
            }
        }

        studentsByPrimarySkill[maxSkill].push(student);
    }

    // Distribute one from each skill category to each team (round-robin)
    let teamIndex = 0;
    for (const skill of skills) {
        for (const student of studentsByPrimarySkill[skill]) {
            teams[teamIndex % numTeams].members.push({
                studentId: student.uid,
                role: skill === 'leadership' ? 'leader' : 'contributor',
                joinedAt: new Date(),
            });
            teamIndex++;
        }
    }

    // Calculate balance scores
    for (const team of teams) {
        const membersWithSkills = team.members.map(m => {
            const st = students.find(s => s.uid === m.studentId);
            return st ? { uid: st.uid, displayName: st.displayName, skills: st.skills } : null;
        }).filter(Boolean) as StudentWithSkills[];
        team.balanceScore = calculateTeamBalance(membersWithSkills);
    }

    return teams;
}

// Role-based strategy: Explicit role assignments
function roleBasedStrategy(students: StudentWithSkills[], teamSize: number, facultyId: string): Team[] {
    const numTeams = Math.ceil(students.length / teamSize);
    const teams: Team[] = [];

    // Initialize teams
    for (let i = 0; i < numTeams; i++) {
        teams.push({
            id: `team_rolebased_${Date.now()}_${i}`,
            name: `Team ${i + 1}`,
            courseId: 'default',
            members: [],
            formationMethod: 'ai_generated',
            createdAt: new Date(),
            createdBy: facultyId,
            status: 'active',
            balanceScore: 0,
            teamSkillVector: {}
        });
    }

    // Sort students by each skill for role assignment
    const leadershipSorted = [...students].sort((a, b) => b.skills.leadership - a.skills.leadership);
    const analyticalSorted = [...students].sort((a, b) => b.skills.analyticalThinking - a.skills.analyticalThinking);
    const creativitySorted = [...students].sort((a, b) => b.skills.creativity - a.skills.creativity);
    const executionSorted = [...students].sort((a, b) => b.skills.executionStrength - a.skills.executionStrength);

    const assigned = new Set<string>();

    // Assign leaders first
    for (let i = 0; i < numTeams && i < leadershipSorted.length; i++) {
        const student = leadershipSorted[i];
        teams[i].members.push({
            studentId: student.uid,
            role: 'leader',
            joinedAt: new Date(),
        });
        assigned.add(student.uid);
    }

    // Assign analysts
    let teamIndex = 0;
    for (const student of analyticalSorted) {
        if (!assigned.has(student.uid) && teams[teamIndex].members.length < teamSize) {
            teams[teamIndex].members.push({
                studentId: student.uid,
                role: 'specialist',
                joinedAt: new Date(),
            });
            assigned.add(student.uid);
            teamIndex = (teamIndex + 1) % numTeams;
        }
    }

    // Assign creatives
    teamIndex = 0;
    for (const student of creativitySorted) {
        if (!assigned.has(student.uid) && teams[teamIndex].members.length < teamSize) {
            teams[teamIndex].members.push({
                studentId: student.uid,
                role: 'specialist',
                joinedAt: new Date(),
            });
            assigned.add(student.uid);
            teamIndex = (teamIndex + 1) % numTeams;
        }
    }

    // Assign executors
    teamIndex = 0;
    for (const student of executionSorted) {
        if (!assigned.has(student.uid) && teams[teamIndex].members.length < teamSize) {
            teams[teamIndex].members.push({
                studentId: student.uid,
                role: 'contributor',
                joinedAt: new Date(),
            });
            assigned.add(student.uid);
            teamIndex = (teamIndex + 1) % numTeams;
        }
    }

    // Calculate balance scores
    for (const team of teams) {
        const membersWithSkills = team.members.map(m => {
            const st = students.find(s => s.uid === m.studentId);
            return st ? { uid: st.uid, displayName: st.displayName, skills: st.skills } : null;
        }).filter(Boolean) as StudentWithSkills[];
        team.balanceScore = calculateTeamBalance(membersWithSkills);
    }

    return teams;
}

// Compare all strategies
export async function getAllStrategiesComparison(
    teamSize: number,
    facultyId: string
): Promise<Record<TeamFormationStrategy, {
    teams: Team[];
    unassignedStudents: any[];
    averageBalanceScore: number;
    strategyRationale: string;
}>> {
    const students = await getAllStudentsWithAssessments();

    if (students.length < teamSize) {
        throw new Error(`Not enough students with completed assessments. Need at least ${teamSize}, found ${students.length}`);
    }

    const balancedTeams = enrichTeamMembers(balancedStrategy(students, teamSize, facultyId), students);
    const complementaryTeams = enrichTeamMembers(complementaryStrategy(students, teamSize, facultyId), students);
    const roleBasedTeams = enrichTeamMembers(roleBasedStrategy(students, teamSize, facultyId), students);

    return {
        balanced: {
            teams: balancedTeams,
            unassignedStudents: [],
            averageBalanceScore: balancedTeams.reduce((sum, t) => sum + (t.balanceScore || 0), 0) / balancedTeams.length,
            strategyRationale: 'Snake draft ensures even distribution of talent across all teams. High performers are distributed first, followed by mid-tier and lower performers in alternating order.'
        },
        complementary: {
            teams: complementaryTeams,
            unassignedStudents: [],
            averageBalanceScore: complementaryTeams.reduce((sum, t) => sum + (t.balanceScore || 0), 0) / complementaryTeams.length,
            strategyRationale: 'Each team gets specialists from different skill areas for comprehensive coverage. Teams have diverse perspectives with clear skill strengths.'
        },
        'role-based': {
            teams: roleBasedTeams,
            unassignedStudents: [],
            averageBalanceScore: roleBasedTeams.reduce((sum, t) => sum + (t.balanceScore || 0), 0) / roleBasedTeams.length,
            strategyRationale: 'Explicit role assignments based on primary strengths. Each member has a clear role: Leader, Analyst, Creative, or Executor.'
        }
    };
}

/**
 * Get the team assigned to a specific student
 * @param _studentId - The UID of the student (not used, backend uses JWT)
 * @returns The team data if found, or {status: "not_assigned"} if not found
 */
export async function getStudentTeam(_studentId: string): Promise<Team | { status: 'not_assigned' }> {
    try {
        const { apiFetch } = await import('./api');

        const response = await apiFetch<{
            success: boolean;
            data: {
                teamId: string;
                teamName: string;
                members: Array<{
                    studentId: string;
                    role: string;
                    joinedAt: string;
                    displayName?: string;
                    email?: string;
                    major?: string;
                    department?: string;
                    skills?: Record<string, number>;
                    githubUsername?: string;
                }>;
                teamSkillVector: Record<string, number>;
                status: string;
                createdBy: string;
                createdAt: string;
            } | null;
            message?: string;
        }>('/teams/my-team');

        if (!response.success || !response.data) {
            return { status: 'not_assigned' };
        }

        const teamData = response.data;

        // Convert backend response to Team type
        const team: Team = {
            id: teamData.teamId,
            name: teamData.teamName,
            members: teamData.members.map(m => ({
                studentId: m.studentId,
                role: (m.role || 'contributor') as any,
                joinedAt: m.joinedAt
            })),
            teamSkillVector: teamData.teamSkillVector,
            status: (teamData.status || 'active') as any,
            createdBy: teamData.createdBy,
            createdAt: teamData.createdAt
        };

        // Attach enriched member data for UI display
        (team as any).memberProfiles = teamData.members.map(m => ({
            uid: m.studentId,
            displayName: m.displayName || '',
            email: m.email || '',
            major: m.major || '',
            department: m.department || '',
            skills: m.skills || {},
            githubUsername: m.githubUsername || '',
            role: 'student'
        }));

        return team;
    } catch (error) {
        console.error('Error fetching student team:', error);
        return { status: 'not_assigned' };
    }
}
