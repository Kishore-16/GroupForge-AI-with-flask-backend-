import { useState, useEffect } from 'react';
import { useAuth, useWebSocket } from '../contexts';
import { DashboardLayout } from '../components/layout';
import { Card, CardBody, CardHeader, Button, SkillBar } from '../components/ui';
import { ChatPanel } from '../components/ui/ChatPanel';
import { getStudentTeam as fetchStudentTeamFromAPI } from '../services/api';
import { StudentTeam, StudentTeamMember } from '../services/api';
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
    User,
    Bell,
    MessageCircle,
    Settings,
    UserPlus,
    Calendar,
    Target,
    Zap,
    Share2
} from 'lucide-react';

interface TeamWithDetails extends Team {
    memberProfiles: StudentProfile[];
}

export function MyTeamsPage() {
    const { userProfile } = useAuth();
    const { onTeamFormed, onTeamUpdated } = useWebSocket();

    const [teams, setTeams] = useState<TeamWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [realtimeUpdate, setRealtimeUpdate] = useState<string | null>(null);
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [showChatPanel, setShowChatPanel] = useState(false);

    // Following UserPlan.md: Check if student is in a team using inTeam and teamId
    const studentProfile = userProfile as StudentProfile | null;
    const isInTeam = studentProfile?.inTeam || false;
    const teamId = studentProfile?.teamId;

    const loadTeamData = async () => {
        // Clear data immediately if user is not authenticated
        if (!userProfile?.uid) {
            setTeams([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            // Following UserPlan.md: Check inTeam flag first
            if (!isInTeam || !teamId) {
                setTeams([]);
                setLoading(false);
                return;
            }

            // Use the getStudentTeam function to fetch the student's team
            const teamData = await fetchStudentTeamFromAPI();

            if (teamData) {
                setTeams([teamData]);
            } else {
                setTeams([]);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
            setTeams([]);
        } finally {
            setLoading(false);
        }
    };

    // Load team data when user profile changes or when user logs in/out
    useEffect(() => {
        loadTeamData();

        // Cleanup: Clear teams when component unmounts or user logs out
        return () => {
            if (!userProfile?.uid) {
                setTeams([]);
            }
        };
    }, [userProfile?.uid, isInTeam, teamId]);

    // Listen for real-time team updates
    useEffect(() => {
        if (!userProfile?.uid) return;

        onTeamFormed((data) => {
            console.log('New team formed:', data);
            // Check if the current user is in the new team
            const isUserInTeam = data.data?.members?.some((member: any) =>
                member.userId === userProfile?.uid || member.studentId === userProfile?.uid
            );

            if (isUserInTeam) {
                setRealtimeUpdate(`You've been added to team: ${data.data?.teamName}`);
                // Refresh team data
                loadTeamData();

                setTimeout(() => setRealtimeUpdate(null), 5000);
            }
        });

        onTeamUpdated((data) => {
            console.log('Team updated:', data);
            setRealtimeUpdate(`Team "${data.data?.teamName}" has been updated`);
            // Refresh team data
            loadTeamData();

            setTimeout(() => setRealtimeUpdate(null), 5000);
        });
    }, [onTeamFormed, onTeamUpdated, userProfile?.uid]);

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
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white p-8 shadow-2xl">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 text-sm font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full w-fit mb-4">
                                <Users className="w-4 h-4" />
                                Team Workspace
                            </div>
                            <h1 className="text-4xl font-bold mb-2 leading-tight">No Team Yet</h1>
                            <p className="text-white/90 text-lg max-w-3xl">
                                {profileCompleted
                                    ? attendedTest
                                        ? 'Your profile is ready! Faculty is forming teams based on your skills. We\'ll notify you when your team is ready.'
                                        : 'Take the skill assessment to become eligible for team formation.'
                                    : 'Complete your profile to become eligible for team formation.'}
                            </p>
                        </div>
                        <div className="absolute right-4 bottom-4 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -left-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                    </div>

                    <Card className="border-0 shadow-xl bg-white dark:bg-gray-900">
                        <CardBody className="p-12">
                            <div className="space-y-8">
                                {/* Status Section */}
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto">
                                        <Users className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {profileCompleted && attendedTest ? 'Team Formation in Progress' : 'Not Eligible Yet'}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto text-lg">
                                        {profileCompleted
                                            ? attendedTest
                                                ? 'Faculty is analyzing skills and forming balanced teams. You\'ll be notified as soon as your team is ready!'
                                                : 'Complete your skill assessment to proceed with team matching.'
                                            : 'Build your profile with your skills and interests first.'}
                                    </p>
                                </div>

                                {/* Eligibility Checklist */}
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 space-y-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Target className="w-5 h-5 text-primary-600" />
                                        Your Eligibility Progress
                                    </h4>

                                    <div className="space-y-3">
                                        {/* Profile Status */}
                                        <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${profileCompleted
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                                            }`}>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${profileCompleted
                                                ? 'bg-green-500/20'
                                                : 'bg-orange-500/20'
                                                }`}>
                                                {profileCompleted ? (
                                                    <CheckCircle2 className={`w-6 h-6 ${profileCompleted ? 'text-green-600 dark:text-green-400' : 'text-orange-600'}`} />
                                                ) : (
                                                    <User className="w-6 h-6 text-orange-600" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 dark:text-white">Profile Complete</p>
                                                <p className={`text-sm ${profileCompleted ? 'text-green-700 dark:text-green-200' : 'text-orange-700 dark:text-orange-200'}`}>
                                                    {profileCompleted ? '✓ Your profile is ready to go!' : 'Add your skills and interests to your profile'}
                                                </p>
                                            </div>
                                            {!profileCompleted && (
                                                <Button variant="primary" size="sm" onClick={() => window.location.href = '/profile'}>
                                                    Complete Now
                                                </Button>
                                            )}
                                        </div>

                                        {/* Assessment Status */}
                                        <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${attendedTest
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                            }`}>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${attendedTest
                                                ? 'bg-green-500/20'
                                                : 'bg-blue-500/20'
                                                }`}>
                                                {attendedTest ? (
                                                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <AlertCircle className="w-6 h-6 text-blue-600" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 dark:text-white">Skill Assessment</p>
                                                <p className={`text-sm ${attendedTest ? 'text-green-700 dark:text-green-200' : 'text-blue-700 dark:text-blue-200'}`}>
                                                    {attendedTest ? '✓ Assessment completed! Your skills are evaluated.' : 'Take the assessment to show your capabilities'}
                                                </p>
                                            </div>
                                            {profileCompleted && !attendedTest && (
                                                <Button variant="primary" size="sm" onClick={() => window.location.href = '/assessment'}>
                                                    Take Assessment
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* What Happens Next */}
                                {profileCompleted && attendedTest && (
                                    <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-800">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-primary-600" />
                                            What Happens Next?
                                        </h4>
                                        <ol className="space-y-3 ml-6">
                                            <li className="text-gray-700 dark:text-gray-300 relative">
                                                <span className="absolute -left-6 font-bold text-primary-600">1.</span>
                                                Faculty reviews your skills and profile
                                            </li>
                                            <li className="text-gray-700 dark:text-gray-300 relative">
                                                <span className="absolute -left-6 font-bold text-primary-600">2.</span>
                                                AI algorithm balances you with compatible teammates
                                            </li>
                                            <li className="text-gray-700 dark:text-gray-300 relative">
                                                <span className="absolute -left-6 font-bold text-primary-600">3.</span>
                                                Your team is formed and you'll get a notification
                                            </li>
                                            <li className="text-gray-700 dark:text-gray-300 relative">
                                                <span className="absolute -left-6 font-bold text-primary-600">4.</span>
                                                Meet your team and start collaborating immediately!
                                            </li>
                                        </ol>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    // Teams view - Show actual team with chat
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Real-time Updates Banner */}
                {realtimeUpdate && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                                <span className="font-medium">Team Update:</span>
                                <span>{realtimeUpdate}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 shadow-2xl">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full w-fit mb-4">
                            <Users className="w-4 h-4" />
                            Team Workspace
                        </div>
                        <h1 className="text-4xl font-bold mb-2">Your Team is Ready! 🎉</h1>
                        <p className="text-white/90 text-lg max-w-3xl">
                            Collaborate, communicate, and build something amazing together. Your team has been carefully matched based on complementary skills.
                        </p>
                    </div>
                    <div className="absolute right-4 bottom-4 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -left-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                <div className={`grid gap-6 ${showChatPanel ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {/* Team Details Section */}
                    <div className={showChatPanel ? 'lg:col-span-2' : 'col-span-1'}>
                        <div className="space-y-6">
                            {teams.map((team) => (
                                <TeamDetailCard
                                    key={team.teamId}
                                    team={team}
                                    currentUserId={userProfile?.uid || ''}
                                    onOpenChat={() => {
                                        setSelectedTeamId(team.teamId);
                                        setShowChatPanel(true);
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Chat Panel */}
                    {showChatPanel && selectedTeamId && (
                        <div className="lg:col-span-1 h-full">
                            {teams.find(t => t.teamId === selectedTeamId) && (
                                <ChatPanel
                                    teamId={selectedTeamId}
                                    teamName={teams.find(t => t.teamId === selectedTeamId)?.teamName || 'Team'}
                                    currentUserId={userProfile?.uid || ''}
                                    currentUserName={userProfile?.displayName || 'You'}
                                    currentUserPhoto={userProfile?.photoURL}
                                    participants={teams.find(t => t.teamId === selectedTeamId)?.members.map(m => m.studentId) || []}
                                    onClose={() => setShowChatPanel(false)}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

function TeamDetailCard({ team, currentUserId, onOpenChat }: { team: TeamWithDetails; currentUserId: string; onOpenChat: () => void }) {
    const [expanded, setExpanded] = useState(true);

    // Following UserPlan.md: Use teamSkillVector for team skill display
    const teamSkillVector = team.teamSkillVector || {};
    const memberCount = team.members?.length || 0;

    return (
        <Card className="border-0 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{team.teamName || `Team ${team.teamId.slice(-6)}`}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${team.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200' :
                                    team.status === 'needs_rebalance' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-200' :
                                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                                    }`}>
                                    {team.status}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                    <Users className="w-4 h-4" />
                                    {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
                                </div>
                                {team.balanceScore && (
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                        <Award className="w-4 h-4" />
                                        Balance Score: <span className="font-semibold text-gray-900 dark:text-white">{Math.round(team.balanceScore)}/100</span>
                                    </div>
                                )}
                                {team.createdAt && (
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        Formed {new Date(team.createdAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onOpenChat}
                            className="flex items-center gap-2"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Open Chat
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? 'Show Less' : 'Show More'}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardBody className="p-6 space-y-6">
                {/* Team Skill Distribution - Following UserPlan.md: Use teamSkillVector */}
                {Object.keys(teamSkillVector).length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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

                {/* Quick Actions */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        Quick Actions
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const emails = team.members.map(m => m.email).filter(Boolean).join(',');
                                if (emails) {
                                    window.location.href = `mailto:${emails}`;
                                }
                            }}
                            className="flex flex-col items-center justify-center gap-2 h-auto py-3"
                        >
                            <Mail className="w-5 h-5" />
                            <span className="text-xs">Email Team</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open('https://meet.google.com', '_blank')}
                            className="flex flex-col items-center justify-center gap-2 h-auto py-3"
                        >
                            <Video className="w-5 h-5" />
                            <span className="text-xs">Google Meet</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open('https://discord.com', '_blank')}
                            className="flex flex-col items-center justify-center gap-2 h-auto py-3"
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span className="text-xs">Discord</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open('https://slack.com', '_blank')}
                            className="flex flex-col items-center justify-center gap-2 h-auto py-3"
                        >
                            <Share2 className="w-5 h-5" />
                            <span className="text-xs">Slack</span>
                        </Button>
                    </div>
                </div>

                {/* Team Members - Expanded View */}
                {expanded && (
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            Team Members ({memberCount})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {team.members.map((member) => (
                                <TeamMemberCard
                                    key={member.studentId}
                                    member={member}
                                    isCurrentUser={member.studentId === currentUserId}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Formation Insight */}
                {team.aiRationale && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                                    Why You Were Matched
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
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

function TeamMemberCard({
    member,
    isCurrentUser
}: {
    member: StudentTeamMember;
    isCurrentUser: boolean;
}) {
    // Get top 3 skills by score
    const topSkills = Object.entries(member.skills || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    return (
        <div className={`p-4 rounded-xl border-2 transition-all ${isCurrentUser
            ? 'border-primary-300 bg-primary-50 dark:bg-primary-500/10 dark:border-primary-500 shadow-md'
            : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
            }`}>
            <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                    {member.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {member.displayName}
                        </p>
                        {isCurrentUser && (
                            <span className="px-2 py-1 bg-primary-200 dark:bg-primary-900/50 text-primary-700 dark:text-primary-200 text-xs font-semibold rounded-full">
                                You
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1 flex items-center gap-1">
                        <UserPlus className="w-3 h-3" />
                        {member.role}
                    </p>
                    {member.joinedAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            {/* Skills Display */}
            {topSkills.length > 0 && (
                <div className="space-y-2 border-t pt-3 dark:border-gray-700">
                    {topSkills.map(([skill, score]) => {
                        // Cap skill score at 100%
                        const cappedScore = Math.min(score * 100, 100);
                        return (
                            <div key={skill}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{skill}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(cappedScore)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-1.5 rounded-full transition-all"
                                        style={{ width: `${cappedScore}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Contact Button */}
            {member.email && (
                <a
                    href={`mailto:${member.email}`}
                    className="mt-3 w-full py-2 px-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-semibold hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors flex items-center justify-center gap-2"
                >
                    <Mail className="w-3 h-3" />
                    Contact
                </a>
            )}
        </div>
    );
}
