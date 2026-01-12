import { useState, useEffect } from 'react';
import { useAuth } from '../contexts';
import { DashboardLayout } from '../components/layout';
import { Card, CardBody, CardHeader, Button, SkillBar } from '../components/ui';
import { getStudentTeam } from '../services';
import { Team, TeamMemberRef } from '../types';
import { StudentProfile } from '../types';
import {
    Users,
    Award,
    TrendingUp,
    MessageSquare,
    Mail,
    ExternalLink,
    Video,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    User
} from 'lucide-react';

interface TeamWithDetails extends Team {
    memberProfiles: StudentProfile[];
}

export function MyTeamsPage() {
    const { userProfile } = useAuth();
    const [teams, setTeams] = useState<TeamWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    // Following UserPlan.md: Check if student is in a team using inTeam and teamId
    const studentProfile = userProfile as StudentProfile | null;
    const isInTeam = studentProfile?.inTeam || false;
    const teamId = studentProfile?.teamId;

    useEffect(() => {
        async function fetchTeams() {
            if (!userProfile?.uid) {
                setLoading(false);
                return;
            }

            try {
                // Following UserPlan.md: Check inTeam flag first
                if (!isInTeam || !teamId) {
                    setTeams([]);
                    setLoading(false);
                    return;
                }

                // Use the getStudentTeam function to fetch the student's team
                const result = await getStudentTeam(userProfile.uid);

                // Check if student is assigned to a team
                if ('status' in result && result.status === 'not_assigned') {
                    setTeams([]);
                    setLoading(false);
                    return;
                }

                // Student has a team - fetch member profiles
                const teamData = result as Team;
                console.log('Team data loaded:', teamData);

                const teamWithDetails: TeamWithDetails = {
                    ...teamData,
                    memberProfiles: []
                };

                setTeams([teamWithDetails]);
            } catch (error) {
                console.error('Error fetching teams:', error);
                setTeams([]);
            } finally {
                setLoading(false);
            }
        }

        fetchTeams();
    }, [userProfile, isInTeam, teamId]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-950 rounded-2xl">
                    <div className="animate-spin rounded-full h-9 w-9 border-3 border-primary-500 border-t-transparent"></div>
                </div>
            </DashboardLayout>
        );
    }

    // Empty state - Following UserPlan.md eligibility criteria
    if (teams.length === 0) {
        const profileCompleted = studentProfile?.profileCompleted || false;
        const attendedTest = studentProfile?.attendedTest || false;

        return (
            <DashboardLayout>
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-indigo-600 to-accent-500 text-white p-6 shadow-lg">
                        <div className="relative z-10 flex flex-col gap-2">
                            <div className="inline-flex items-center gap-2 text-sm font-semibold bg-white/10 px-3 py-1 rounded-full w-fit">
                                <Users className="w-4 h-4" />
                                My Teams
                            </div>
                            <h1 className="text-3xl font-bold leading-tight">No Team Yet</h1>
                            <p className="text-white/85 text-sm max-w-2xl">
                                {profileCompleted
                                    ? attendedTest
                                        ? 'Your profile is ready! Wait for faculty to form teams.'
                                        : 'Take the skill assessment to become eligible for team formation.'
                                    : 'Complete your profile to become eligible for team formation.'}
                            </p>
                        </div>
                        <div className="absolute right-4 bottom-4 w-28 h-28 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute -left-8 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                    </div>

                    <Card className="border-0 shadow-xl bg-white dark:bg-gray-900">
                        <CardBody className="p-12 text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {profileCompleted && attendedTest ? 'Waiting for Team Assignment' : 'Not Eligible Yet'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-300 max-w-md mx-auto">
                                {profileCompleted
                                    ? attendedTest
                                        ? 'You\'ve completed all requirements! Faculty will form teams based on skill matching.'
                                        : 'Take the skill assessment to complete your eligibility requirements.'
                                    : 'Complete your profile and select your skills to become eligible for team matching.'}
                            </p>

                            {/* Eligibility Status */}
                            <div className="flex justify-center gap-4 mt-6">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${profileCompleted
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                    {profileCompleted ? <CheckCircle2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    Profile {profileCompleted ? 'Complete' : 'Incomplete'}
                                </div>
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${attendedTest
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                    {attendedTest ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    Assessment {attendedTest ? 'Done' : 'Pending'}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 justify-center mt-6">
                                {!profileCompleted && (
                                    <Button variant="primary" onClick={() => window.location.href = '/profile'}>
                                        Complete Profile
                                    </Button>
                                )}
                                {profileCompleted && !attendedTest && (
                                    <Button variant="primary" onClick={() => window.location.href = '/assessment'}>
                                        Take Assessment
                                    </Button>
                                )}
                                {profileCompleted && attendedTest && (
                                    <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                                        Back to Dashboard
                                    </Button>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    // Teams view
    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-indigo-600 to-accent-500 text-white p-6 shadow-lg">
                    <div className="relative z-10 flex flex-col gap-1">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold bg-white/10 px-3 py-1 rounded-full w-fit">
                            <Users className="w-4 h-4" />
                            Team Workspace
                        </div>
                        <h1 className="text-3xl font-bold leading-tight">My Teams</h1>
                        <p className="text-white/85 text-sm max-w-2xl">
                            Collaborate, meet, and track balance scores across your assigned teams.
                        </p>
                    </div>
                    <div className="absolute right-4 bottom-4 w-28 h-28 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -left-8 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                </div>

                <div className="space-y-6">
                    {teams.map((team) => (
                        <TeamCard key={team.id} team={team} currentUserId={userProfile?.uid || ''} />
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

function TeamCard({ team, currentUserId }: { team: TeamWithDetails; currentUserId: string }) {
    const [expanded, setExpanded] = useState(false);

    // Following UserPlan.md: Use teamSkillVector for team skill display
    const teamSkillVector = team.teamSkillVector || {};
    const memberCount = team.members?.length || 0;

    return (
        <Card className="border-0 shadow-xl bg-white dark:bg-gray-900">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{team.name || `Team ${team.id.slice(-6)}`}</h3>
                            <div className="flex items-center gap-4 mt-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
                                </p>
                                {team.balanceScore && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-100 rounded text-xs font-medium">
                                        <Award className="w-3 h-3" />
                                        Balance Score: {Math.round(team.balanceScore)}
                                    </span>
                                )}
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize ${team.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-100' :
                                    team.status === 'needs_rebalance' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-100' :
                                        'bg-gray-50 text-gray-700 dark:bg-gray-700/60 dark:text-gray-200'
                                    }`}>
                                    {team.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? 'Show Less' : 'Show More'}
                    </Button>
                </div>
            </CardHeader>

            <CardBody className="p-6 space-y-6">
                {/* Team Skill Distribution - Following UserPlan.md: Use teamSkillVector */}
                {Object.keys(teamSkillVector).length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary-600" />
                            Team Skill Distribution
                        </h4>
                        <div className="space-y-3">
                            {Object.entries(teamSkillVector).map(([skillName, score]) => (
                                <SkillBar
                                    key={skillName}
                                    label={skillName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    score={score as number}
                                    confidence="medium"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Communication & Collaboration */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary-600" />
                        Communication & Collaboration
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const emails = team.memberProfiles.map(p => p.email).join(',');
                                window.location.href = `mailto:${emails}`;
                            }}
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            Email Team
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open('https://discord.com', '_blank')}
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Discord
                            <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open('https://meet.google.com', '_blank')}
                        >
                            <Video className="w-4 h-4 mr-2" />
                            Google Meet
                            <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open('https://slack.com', '_blank')}
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Slack
                            <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                    </div>
                </div>

                {/* Team Members - Expanded View */}
                {expanded && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary-600" />
                            Team Members
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {team.memberProfiles.map((member) => (
                                <MemberCard
                                    key={member.uid}
                                    member={member}
                                    teamMember={team.members.find(m => (m as any).studentId === member.uid || (m as any).userId === member.uid)!}
                                    isCurrentUser={member.uid === currentUserId}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Formation Insight */}
                {team.aiRationale && (
                    <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-500/10 dark:to-accent-500/10 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                    AI Team Formation Insight
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-200">
                                    {team.aiRationale}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}

function MemberCard({
    member,
    teamMember,
    isCurrentUser
}: {
    member: StudentProfile;
    teamMember: TeamMemberRef;
    isCurrentUser: boolean;
}) {
    // Get top 3 skills to display
    const skillEntries = member.skills && typeof member.skills === 'object'
        ? Object.entries(member.skills).filter(([_, v]) => typeof v === 'number').slice(0, 3)
        : [];

    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500'];

    return (
        <div className={`p-4 rounded-lg border-2 ${isCurrentUser
            ? 'border-primary-300 bg-primary-50 dark:bg-primary-500/10 dark:border-primary-500'
            : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
            }`}>
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {member.photoURL ? (
                        <img
                            src={member.photoURL}
                            alt={member.displayName}
                            className="w-10 h-10 rounded-full"
                        />
                    ) : (
                        <span className="text-white font-semibold text-sm">
                            {member.displayName?.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h5 className="font-medium text-gray-900 dark:text-white truncate">
                            {member.displayName}
                            {isCurrentUser && (
                                <span className="ml-2 text-xs text-primary-600 font-normal">(You)</span>
                            )}
                        </h5>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
                        {teamMember.role}
                    </p>

                    {/* Member Skills (Following UserPlan.md schema) */}
                    {skillEntries.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                            {skillEntries.map(([skillName, score], index) => (
                                <div key={skillName} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 w-20 truncate">
                                        {skillName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${colors[index % colors.length]} rounded-full`}
                                            style={{ width: `${score as number}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-600 dark:text-gray-300 w-8 text-right">
                                        {score as number}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Contact */}
                    {member.email && (
                        <a
                            href={`mailto:${member.email}`}
                            className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200 mt-2 inline-flex items-center gap-1"
                        >
                            <Mail className="w-3 h-3" />
                            Contact
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
