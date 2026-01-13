import { useState, useEffect } from 'react';
import { useAuth, useWebSocket } from '../contexts';
import { DashboardLayout } from '../components/layout';
import { Card, CardBody, CardHeader, Button, SkillBar } from '../components/ui';
import {
    ClipboardCheck,
    Users,
    ArrowRight,
    Award,
    Target,
    Zap,
    TrendingUp,
    BookOpen,
    Calendar,
    Brain,
    Sparkles,
    BarChart3,
    CheckCircle2,
    Star,
    Activity,
    AlertCircle,
    User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StudentProfile, getProfileCompletionStatus } from '../types';
import { getMetaStats } from '../services/metaService';
import { fetchAllTeams, fetchEligibleStudents, TeamResponse } from '../services/api';

export function DashboardPage() {
    const { userProfile } = useAuth();

    if (userProfile?.role === 'student') {
        return <StudentDashboard profile={userProfile as StudentProfile} />;
    }

    if (userProfile?.role === 'faculty') {
        return <FacultyDashboard />;
    }

    return <AdminDashboard />;
}

function StudentDashboard({ profile }: { profile: StudentProfile }) {
    const { refreshUserProfile } = useAuth();
    const webSocket = useWebSocket();

    // Listen for real-time updates
    useEffect(() => {
        // Listen for profile updates
        webSocket.onProfileUpdate((data) => {
            console.log('📬 Profile updated, refreshing...', data);
            refreshUserProfile();
        });

        // Listen for assessment completion
        webSocket.onAssessmentCompleted((data) => {
            console.log('📬 Assessment completed, refreshing...', data);
            refreshUserProfile();
        });

        // Listen for team assignments
        webSocket.onTeamFormed((data) => {
            console.log('📬 Team formed, refreshing...', data);
            refreshUserProfile();
        });

        webSocket.onTeamUpdated((data) => {
            console.log('📬 Team updated, refreshing...', data);
            refreshUserProfile();
        });

        return () => {
            // Cleanup listeners
            webSocket.offProfileUpdate();
            webSocket.offAssessmentCompleted();
            webSocket.offTeamFormed();
            webSocket.offTeamUpdated();
        };
    }, [webSocket, refreshUserProfile]);

    // Following UserPlan.md: Check actual profile status
    const completionStatus = getProfileCompletionStatus(profile);
    const hasCompletedAssessment = profile.attendedTest;
    const hasSkillScores = profile.skills && Object.keys(profile.skills).length > 0 &&
        Object.values(profile.skills).some(score => score > 0);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Welcome Header with Gradient */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 p-8 text-white">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-sm font-medium opacity-90">Welcome back!</span>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">
                            Hey, {profile.displayName?.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-primary-100 max-w-2xl">
                            {!completionStatus.profileCompleted
                                ? 'Complete your profile to unlock AI-powered team matching and skill assessments.'
                                : !completionStatus.assessmentCompleted
                                    ? 'Your profile is ready! Take the assessment to get matched with the perfect team.'
                                    : completionStatus.inTeam
                                        ? 'You\'re all set! Check out your team and start collaborating.'
                                        : 'Assessment completed! Wait for faculty to form teams or check your skill profile.'}
                        </p>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full mr-20 -mb-24"></div>
                </div>

                {/* Journey Progress Banner (Following UserPlan.md) */}
                <Card className="border-2 border-primary-200 dark:border-primary-800 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Journey</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${completionStatus.inTeam
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                : completionStatus.assessmentCompleted
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                    : completionStatus.profileCompleted
                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
                                }`}>
                                {completionStatus.inTeam ? 'In Team' :
                                    completionStatus.assessmentCompleted ? 'Awaiting Team' :
                                        completionStatus.profileCompleted ? 'Ready for Assessment' : 'Getting Started'}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Step 1: Profile */}
                            <div className="flex-1">
                                <div className={`flex items-center gap-2 mb-2 ${completionStatus.profileCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completionStatus.profileCompleted ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                        {completionStatus.profileCompleted ? <CheckCircle2 className="w-5 h-5" /> : <User className="w-4 h-4" />}
                                    </div>
                                    <span className="font-medium text-sm">Profile</span>
                                </div>
                                <div className={`h-2 rounded-full ${completionStatus.profileCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                            </div>

                            {/* Connector */}
                            <div className={`w-8 h-0.5 ${completionStatus.profileCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>

                            {/* Step 2: Assessment */}
                            <div className="flex-1">
                                <div className={`flex items-center gap-2 mb-2 ${completionStatus.assessmentCompleted ? 'text-green-600 dark:text-green-400' : completionStatus.profileCompleted ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completionStatus.assessmentCompleted ? 'bg-green-100 dark:bg-green-900/50' : completionStatus.profileCompleted ? 'bg-primary-100 dark:bg-primary-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                        {completionStatus.assessmentCompleted ? <CheckCircle2 className="w-5 h-5" /> : <ClipboardCheck className="w-4 h-4" />}
                                    </div>
                                    <span className="font-medium text-sm">Assessment</span>
                                </div>
                                <div className={`h-2 rounded-full ${completionStatus.assessmentCompleted ? 'bg-green-500' : completionStatus.profileCompleted ? 'bg-primary-200 dark:bg-primary-800' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                            </div>

                            {/* Connector */}
                            <div className={`w-8 h-0.5 ${completionStatus.assessmentCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>

                            {/* Step 3: Team */}
                            <div className="flex-1">
                                <div className={`flex items-center gap-2 mb-2 ${completionStatus.inTeam ? 'text-green-600 dark:text-green-400' : completionStatus.assessmentCompleted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completionStatus.inTeam ? 'bg-green-100 dark:bg-green-900/50' : completionStatus.assessmentCompleted ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                        {completionStatus.inTeam ? <CheckCircle2 className="w-5 h-5" /> : <Users className="w-4 h-4" />}
                                    </div>
                                    <span className="font-medium text-sm">Team</span>
                                </div>
                                <div className={`h-2 rounded-full ${completionStatus.inTeam ? 'bg-green-500' : completionStatus.assessmentCompleted ? 'bg-blue-200 dark:bg-blue-800' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                            </div>
                        </div>

                        {/* Next Action */}
                        {!completionStatus.inTeam && (
                            <div className="mt-4 pt-4 border-t border-primary-200 dark:border-primary-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                        <AlertCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {completionStatus.nextStep === 'complete-profile' && 'Complete your profile to continue'}
                                            {completionStatus.nextStep === 'take-assessment' && 'Take the skill assessment to get matched with teams'}
                                            {completionStatus.nextStep === 'wait-for-team' && 'Waiting for faculty to form teams'}
                                        </span>
                                    </div>
                                    {completionStatus.nextStep !== 'wait-for-team' && (
                                        <Link to={completionStatus.nextStep === 'complete-profile' ? '/profile' : '/assessment'}>
                                            <Button size="sm" className="gap-2">
                                                {completionStatus.nextStep === 'complete-profile' ? 'Complete Profile' : 'Take Assessment'}
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Enhanced Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="group hover:shadow-lg dark:hover:shadow-primary-500/10 transition-all duration-300 border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <ClipboardCheck className="w-7 h-7 text-white" />
                                </div>
                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${hasCompletedAssessment
                                    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/50'
                                    : 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/50'
                                    }`}>
                                    {hasCompletedAssessment ? 'Completed' : 'Pending'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Assessment Status</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {hasCompletedAssessment ? (profile.latestAssessment?.score || 'Done') : 'Not Taken'}
                                </p>
                                {hasCompletedAssessment && profile.latestAssessment?.score && (
                                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4" />
                                        Score
                                    </span>
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="group hover:shadow-lg dark:hover:shadow-accent-500/10 transition-all duration-300 border-2 border-transparent hover:border-accent-200 dark:hover:border-accent-800">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Users className="w-7 h-7 text-white" />
                                </div>
                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${profile.inTeam
                                    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/50'
                                    : 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50'
                                    }`}>
                                    {profile.inTeam ? 'Assigned' : 'Not Assigned'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Team Status</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {profile.inTeam ? 'In Team' : 'Waiting'}
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="group hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Award className="w-7 h-7 text-white" />
                                </div>
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 px-3 py-1 rounded-full flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    Skills
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Selected Skills</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {profile.selectedSkills?.length || 0}
                                </p>
                                <span className="text-sm text-gray-400">
                                    skills
                                </span>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Enhanced Skill Profile - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Brain className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                            Your Skill Profile
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-analyzed competencies and strengths</p>
                                    </div>
                                    <Link to="/assessment">
                                        <Button size="sm" className="gap-2">
                                            <Activity className="w-4 h-4" />
                                            {hasCompletedAssessment ? 'Retake' : 'Start'} Assessment
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardBody className="p-6">
                                {hasSkillScores ? (
                                    <div className="space-y-5">
                                        {/* Display skills from UserPlan.md schema: skills object with scores */}
                                        {Object.entries(profile.skills).map(([skillName, score]) => (
                                            <SkillBar
                                                key={skillName}
                                                label={skillName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                score={score as number}
                                                confidence="high"
                                            />
                                        ))}
                                        {profile.latestAssessment && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Overall Score</span>
                                                    <span className="font-semibold text-primary-600 dark:text-primary-400">
                                                        {profile.latestAssessment.score}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm mt-1">
                                                    <span className="text-gray-500 dark:text-gray-400">Last Assessed</span>
                                                    <span className="text-gray-600 dark:text-gray-300">
                                                        {new Date(profile.latestAssessment.takenAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : hasCompletedAssessment && profile.selectedSkills?.length > 0 ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            Assessment completed. Your selected skills:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.selectedSkills.map(skill => (
                                                <span
                                                    key={skill}
                                                    className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                                                >
                                                    {skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : profile.selectedSkills?.length > 0 ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            Your selected skills (take assessment to get scores):
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.selectedSkills.map(skill => (
                                                <span
                                                    key={skill}
                                                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                                                >
                                                    {skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                            ))}
                                        </div>
                                        <Link to="/assessment" className="block mt-4">
                                            <Button className="w-full gap-2">
                                                <Sparkles className="w-4 h-4" />
                                                Take Assessment to Get Scores
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/50 dark:to-accent-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                                            <Target className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Start Your Journey</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                                            {!profile.profileCompleted
                                                ? 'Complete your profile and select skills to begin'
                                                : 'Take your first AI-powered skill assessment to unlock personalized team matching'}
                                        </p>
                                        <Link to={profile.profileCompleted ? '/assessment' : '/profile'}>
                                            <Button className="gap-2">
                                                <Sparkles className="w-4 h-4" />
                                                {profile.profileCompleted ? 'Begin Assessment' : 'Complete Profile'}
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>

                    {/* Enhanced Quick Actions */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    Quick Actions
                                </h2>
                            </CardHeader>
                            <CardBody className="space-y-3 p-4">
                                <Link to="/assessment" className="block group">
                                    <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-900/30 hover:to-transparent transition-all">
                                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <ClipboardCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">Take Assessment</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">AI-powered evaluation</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>

                                <Link to="/profile" className="block group">
                                    <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 hover:border-accent-300 dark:hover:border-accent-700 hover:bg-gradient-to-r hover:from-accent-50 dark:hover:from-accent-900/30 hover:to-transparent transition-all">
                                        <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Sparkles className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-accent-700 dark:group-hover:text-accent-400 transition-colors">Complete Profile</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Add skills & resume</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-accent-600 dark:group-hover:text-accent-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>

                                <Link to="/my-teams" className="block group">
                                    <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gradient-to-r hover:from-blue-50 dark:hover:from-blue-900/30 hover:to-transparent transition-all">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">My Teams</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">View assignments</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            </CardBody>
                        </Card>

                        {/* Progress Card */}
                        <Card className={`border-2 ${completionStatus.inTeam
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800'
                            : hasCompletedAssessment
                                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800'
                                : 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-200 dark:border-yellow-800'
                            }`}>
                            <CardBody className="p-5">
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${completionStatus.inTeam
                                        ? 'bg-green-100 dark:bg-green-900/50'
                                        : hasCompletedAssessment
                                            ? 'bg-blue-100 dark:bg-blue-900/50'
                                            : 'bg-yellow-100 dark:bg-yellow-900/50'
                                        }`}>
                                        {completionStatus.inTeam ? (
                                            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        ) : hasCompletedAssessment ? (
                                            <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        ) : (
                                            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                            {completionStatus.inTeam
                                                ? 'Team Assigned!'
                                                : hasCompletedAssessment
                                                    ? 'Assessment Complete!'
                                                    : 'Action Required'}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                            {completionStatus.inTeam
                                                ? 'You\'ve been assigned to a team. Check your team page!'
                                                : hasCompletedAssessment
                                                    ? 'Great job! Wait for faculty to form teams.'
                                                    : !profile.profileCompleted
                                                        ? 'Complete your profile to continue.'
                                                        : 'Take the assessment to get matched with teams.'}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.profileCompleted && (
                                                <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-gray-700 dark:text-gray-300 font-medium">
                                                    ✓ Profile Complete
                                                </span>
                                            )}
                                            {hasCompletedAssessment && (
                                                <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-gray-700 dark:text-gray-300 font-medium">
                                                    ✓ Assessment Done
                                                </span>
                                            )}
                                            {completionStatus.inTeam && (
                                                <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-gray-700 dark:text-gray-300 font-medium">
                                                    ✓ In Team
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

interface CourseData {
    id: string;
    name: string;
    code: string;
    semester: string;
    enrolledStudents: string[] | number;
    teams: string[];
    status: 'active' | 'archived';
    createdAt?: any;
}

function FacultyDashboard() {
    const { userProfile } = useAuth();
    const [stats, setStats] = useState({
        totalStudents: 0,
        teamsFormed: 0,
        assessmentRate: 0,
        eligibleStudents: 0
    });
    const [recentTeams, setRecentTeams] = useState<TeamResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Clear data immediately if user is not authenticated
        if (!userProfile?.uid) {
            setRecentTeams([]);
            setStats({
                totalStudents: 0,
                teamsFormed: 0,
                assessmentRate: 0,
                eligibleStudents: 0
            });
            setLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch all required data in parallel
                const [metaStats, teamsData, eligibleStudentsData] = await Promise.all([
                    getMetaStats(),
                    fetchAllTeams(),
                    fetchEligibleStudents()
                ]);

                const { usersCount, assessedUsersCount } = metaStats;

                // Filter active teams
                const activeTeams = teamsData.filter(t => t.status === 'active' || t.status === 'completed');

                // Get 5 most recent teams
                const sortedTeams = [...teamsData].sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setRecentTeams(sortedTeams.slice(0, 5));

                setStats({
                    totalStudents: usersCount,
                    eligibleStudents: assessedUsersCount, // Use assessedUsersCount instead of eligibleStudentsData.length
                    teamsFormed: activeTeams.length,
                    assessmentRate: usersCount > 0 ? Math.round((assessedUsersCount / usersCount) * 100) : 0
                });

                setLoading(false);
            } catch (err: any) {
                console.error('Error fetching faculty dashboard:', err);
                setLoading(false);
            }
        };

        fetchDashboardData();

        // Cleanup: Clear data when component unmounts or user logs out
        return () => {
            if (!userProfile?.uid) {
                setRecentTeams([]);
                setStats({
                    totalStudents: 0,
                    teamsFormed: 0,
                    assessmentRate: 0,
                    eligibleStudents: 0
                });
            }
        };
    }, [userProfile?.uid]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Modern Faculty Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-semibold uppercase tracking-wide">Faculty Dashboard</span>
                                </div>
                                <h1 className="text-4xl font-bold mb-2">
                                    Welcome, {userProfile?.displayName?.split(' ')[0]}! 👋
                                </h1>
                                <p className="text-white/90 text-lg max-w-2xl">
                                    Manage students, review submissions, and create balanced teams with AI-powered insights.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="group hover:shadow-xl dark:hover:shadow-blue-500/20 transition-all duration-300 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-1">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Users className="w-7 h-7 text-white" />
                                </div>
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Students</p>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                {loading ? '...' : stats.totalStudents}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Registered users</p>
                        </CardBody>
                    </Card>

                    <Card className="group hover:shadow-xl dark:hover:shadow-green-500/20 transition-all duration-300 border-2 border-transparent hover:border-green-300 dark:hover:border-green-700 hover:-translate-y-1">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <CheckCircle2 className="w-7 h-7 text-white" />
                                </div>
                                <Star className="w-5 h-5 text-yellow-500" />
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Eligible Students</p>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                {loading ? '...' : stats.eligibleStudents}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Assessment completed</p>
                        </CardBody>
                    </Card>

                    <Card className="group hover:shadow-xl dark:hover:shadow-purple-500/20 transition-all duration-300 border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-700 hover:-translate-y-1">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Target className="w-7 h-7 text-white" />
                                </div>
                                <Activity className="w-5 h-5 text-blue-500" />
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Teams Formed</p>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                {loading ? '...' : stats.teamsFormed}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Active groups</p>
                        </CardBody>
                    </Card>

                    <Card className="group hover:shadow-xl dark:hover:shadow-orange-500/20 transition-all duration-300 border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-700 hover:-translate-y-1">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <BarChart3 className="w-7 h-7 text-white" />
                                </div>
                                <Sparkles className="w-5 h-5 text-purple-500" />
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Assessment Rate</p>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                {loading ? '...' : `${stats.assessmentRate}%`}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Completion rate</p>
                        </CardBody>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Student Submissions Section - 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Pending Reviews */}
                        <Card className="hover:shadow-lg transition-all duration-300">
                            <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <ClipboardCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                            Student Submissions
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and manage student assessments</p>
                                    </div>
                                    <Link to="/analytics">
                                        <Button variant="outline" className="gap-2">
                                            <BarChart3 className="w-4 h-4" />
                                            View All
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardBody className="p-6">
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-pulse space-y-3">
                                            <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                                            <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                                        </div>
                                    </div>
                                ) : stats.eligibleStudents > 0 ? (
                                    <div className="space-y-4">
                                        <div className="p-5 rounded-xl border-2 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-all group">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">Assessments Completed</h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{stats.eligibleStudents} students have finished their skill assessment</p>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                                                    {stats.assessmentRate}%
                                                </span>
                                            </div>
                                            <Link to="/analytics">
                                                <Button variant="outline" size="sm" className="w-full mt-2 group-hover:bg-green-600 group-hover:text-white transition-all">
                                                    View Detailed Results
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </Link>
                                        </div>

                                        {stats.totalStudents - stats.eligibleStudents > 0 && (
                                            <div className="p-5 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-all">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                                                        <AlertCircle className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">Pending Assessments</h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {stats.totalStudents - stats.eligibleStudents} students haven't completed their assessment yet
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                                            <ClipboardCheck className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Submissions Yet</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                                            Student submissions will appear here once they complete their assessments
                                        </p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        {/* Recent Teams */}
                        <Card className="hover:shadow-lg transition-all duration-300">
                            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Recent Teams
                                </h3>
                            </CardHeader>
                            <CardBody className="p-5">
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                                    </div>
                                ) : recentTeams.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentTeams.map((team) => (
                                            <div
                                                key={team.id}
                                                className="p-4 rounded-lg bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border-2 border-blue-100 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{team.name}</h4>
                                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${team.status === 'active'
                                                        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                                                        : team.status === 'completed'
                                                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                                        }`}>
                                                        {team.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No teams yet</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Teams will appear here once created</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>

                    {/* Quick Actions & Stats */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card className="hover:shadow-lg transition-all duration-300">
                            <CardHeader className="border-b bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                    Quick Actions
                                </h2>
                            </CardHeader>
                            <CardBody className="space-y-3 p-4">
                                <Link to="/team-formation" className="block group">
                                    <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-purple-100 dark:border-purple-900 hover:border-purple-400 dark:hover:border-purple-600 bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/30 hover:shadow-md transition-all">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400">Form Teams</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">AI-powered matching</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>

                                <Link to="/analytics" className="block group">
                                    <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-100 dark:border-blue-900 hover:border-blue-400 dark:hover:border-blue-600 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/30 hover:shadow-md transition-all">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                            <BarChart3 className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">View Analytics</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Student insights</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>

                                <Link to="/profile" className="block group">
                                    <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-green-100 dark:border-green-900 hover:border-green-400 dark:hover:border-green-600 bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/30 hover:shadow-md transition-all">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400">My Profile</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">View & edit</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-green-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            </CardBody>
                        </Card>

                        {/* Student Progress Overview */}
                        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all">
                            <CardHeader className="border-b border-indigo-100 dark:border-indigo-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    Student Progress
                                </h3>
                            </CardHeader>
                            <CardBody className="p-5 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">Assessments Complete</span>
                                        <span className="text-gray-900 dark:text-white font-bold">{stats.assessmentRate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500 shadow-inner"
                                            style={{ width: `${stats.assessmentRate}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {stats.eligibleStudents} of {stats.totalStudents} students assessed
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-indigo-100 dark:border-indigo-800">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Formation Status</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${stats.eligibleStudents >= 10
                                            ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                                            : 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400'
                                            }`}>
                                            {stats.eligibleStudents >= 10 ? 'Ready' : 'Pending'}
                                        </span>
                                    </div>
                                    {stats.eligibleStudents >= 10 ? (
                                        <Link to="/team-formation">
                                            <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg">
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Start Team Formation
                                            </Button>
                                        </Link>
                                    ) : (
                                        <p className="text-xs text-center text-gray-600 dark:text-gray-400 py-2">
                                            Need {10 - stats.eligibleStudents} more assessed student{10 - stats.eligibleStudents !== 1 ? 's' : ''} to form teams
                                        </p>
                                    )}
                                </div>
                            </CardBody>
                        </Card>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function AdminDashboard() {
    const [stats, setStats] = useState({
        institutions: 0,
        totalUsers: 0,
        assessments: 0,
        teamsCreated: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setLoading(true);

                // Firebase database removed - using metaService
                console.warn('Firebase database removed - using metaService for admin data');

                const { usersCount, assessedUsersCount } = await getMetaStats();

                setStats({
                    institutions: 1,
                    totalUsers: usersCount,
                    assessments: assessedUsersCount,
                    teamsCreated: 0
                });
            } catch (error) {
                console.error('Error fetching admin data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();

        // Firebase database removed - real-time listener disabled
        // const usersRef = collection(db, 'users');
        // const unsubscribe = onSnapshot(usersRef, () => {
        //     fetchAdminData();
        // });
        // return () => unsubscribe();
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Enhanced Admin Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-8 text-white">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5" />
                            <span className="text-sm font-medium opacity-90">Admin Control Center</span>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">
                            Platform Overview ⚡
                        </h1>
                        <p className="text-gray-300 max-w-2xl">
                            Monitor and manage the entire platform. Access analytics, manage users, and oversee all activities.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full mr-20 -mb-24"></div>
                </div>

                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="group hover:shadow-lg dark:hover:shadow-primary-500/10 transition-all duration-300 border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <BookOpen className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Institutions</p>
                            <div className="flex items-baseline gap-2">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {loading ? '...' : stats.institutions}
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500">registered</span>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="group hover:shadow-lg dark:hover:shadow-accent-500/10 transition-all duration-300 border-2 border-transparent hover:border-accent-200 dark:hover:border-accent-800">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Users className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Users</p>
                            <div className="flex items-baseline gap-2">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {loading ? '...' : stats.totalUsers}
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500">active</span>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="group hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <ClipboardCheck className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Assessments</p>
                            <div className="flex items-baseline gap-2">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {loading ? '...' : stats.assessments}
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500">completed</span>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="group hover:shadow-lg dark:hover:shadow-purple-500/10 transition-all duration-300 border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Target className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Teams Created</p>
                            <div className="flex items-baseline gap-2">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {loading ? '...' : stats.teamsCreated}
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500">total</span>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Admin Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg dark:hover:shadow-primary-500/10 transition-all">
                        <CardHeader className="bg-gradient-to-r from-primary-50 to-white dark:from-primary-900/30 dark:to-gray-900/50 border-b dark:border-gray-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                User Management
                            </h3>
                        </CardHeader>
                        <CardBody className="p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                Manage users, roles, and permissions across the platform
                            </p>
                            <Button variant="outline" className="w-full">View All Users</Button>
                        </CardBody>
                    </Card>

                    <Card className="hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-900/50 border-b dark:border-gray-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                Analytics
                            </h3>
                        </CardHeader>
                        <CardBody className="p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                View detailed analytics and platform insights
                            </p>
                            <Button variant="outline" className="w-full">View Analytics</Button>
                        </CardBody>
                    </Card>

                    <Card className="hover:shadow-lg dark:hover:shadow-purple-500/10 transition-all">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/30 dark:to-gray-900/50 border-b dark:border-gray-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                System Health
                            </h3>
                        </CardHeader>
                        <CardBody className="p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                Monitor system performance and activity logs
                            </p>
                            <Button variant="outline" className="w-full">Check Status</Button>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Helper function to calculate overall skill level from UserPlan.md schema
function getOverallLevel(skills: StudentProfile['skills']): string {
    if (!skills || typeof skills !== 'object') return 'N/A';

    const skillValues = Object.values(skills).filter(v => typeof v === 'number') as number[];
    if (skillValues.length === 0) return 'N/A';

    const avg = skillValues.reduce((sum, score) => sum + score, 0) / skillValues.length;

    if (avg >= 80) return 'Expert';
    if (avg >= 60) return 'Advanced';
    if (avg >= 40) return 'Intermediate';
    if (avg > 0) return 'Beginner';
    return 'N/A';
}
