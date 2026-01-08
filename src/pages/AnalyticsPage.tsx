import { useState, useEffect } from 'react';
import { useAuth } from '../contexts';
import { DashboardLayout } from '../components/layout';
import { Card, CardBody, CardHeader } from '../components/ui';
import { getMetaStats } from '../services/metaService';
import {
    AlertCircle,
    BarChart3,
    BookOpen,
    Users,
    Target,
    TrendingUp,
    Activity,
    CheckCircle,
    Clock,
    Award,
    PieChart
} from 'lucide-react';

interface AnalyticsData {
    totalCourses: number;
    totalStudents: number;
    totalTeams: number;
    assessmentRate: number;
    completedAssessments: number;
    pendingAssessments: number;
    skillDistribution: { [key: string]: number };
    teamPerformance: {
        excellent: number;
        good: number;
        average: number;
        needsImprovement: number;
    };
}

export function AnalyticsPage() {
    const { userProfile } = useAuth();
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        totalCourses: 0,
        totalStudents: 0,
        totalTeams: 0,
        assessmentRate: 0,
        completedAssessments: 0,
        pendingAssessments: 0,
        skillDistribution: {},
        teamPerformance: {
            excellent: 0,
            good: 0,
            average: 0,
            needsImprovement: 0
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userProfile?.role === 'faculty' && userProfile?.uid) {
            fetchAnalytics();
        }
    }, [userProfile]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            // Firebase database removed
            console.warn('Firebase database removed - returning mock analytics data');

            const { usersCount, assessedUsersCount } = await getMetaStats();
            const totalStudentsCount = usersCount;
            const completedAssessmentsCount = assessedUsersCount;
            const pendingAssessments = Math.max(totalStudentsCount - completedAssessmentsCount, 0);
            const assessmentRate = totalStudentsCount > 0
                ? Math.round((completedAssessmentsCount / totalStudentsCount) * 100)
                : 0;

            const totalTeamsCount = 0; // Will be updated when team data is available

            setAnalytics({
                totalCourses: 0,
                totalStudents: totalStudentsCount,
                totalTeams: totalTeamsCount,
                assessmentRate,
                completedAssessments: completedAssessmentsCount,
                pendingAssessments,
                skillDistribution: {},
                teamPerformance: {
                    excellent: 0,
                    good: 0,
                    average: 0,
                    needsImprovement: Math.round(totalTeamsCount * 0.09)
                }
            });
        } catch (err: any) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (userProfile?.role !== 'faculty') {
        return (
            <DashboardLayout>
                <div className="max-w-7xl mx-auto">
                    <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-yellow-600 mb-2" />
                        <h2 className="text-lg font-semibold text-gray-900">Faculty Access Only</h2>
                        <p className="text-gray-600 mt-1">Analytics are only available for faculty members.</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-7 h-7 text-primary-600" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your courses, students, and team performance</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Courses</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{analytics.totalCourses}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{analytics.totalStudents}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-green-600 dark:text-green-300" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Teams Formed</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{analytics.totalTeams}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Assessment Rate</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{analytics.assessmentRate}%</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-300" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Assessment Progress */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary-600" />
                                Assessment Progress
                            </h3>
                        </CardHeader>
                        <CardBody className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-300" />
                                            Completed
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {analytics.completedAssessments} students
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                                        <div
                                            className="bg-green-600 dark:bg-green-400 h-2 rounded-full"
                                            style={{
                                                width: `${(analytics.completedAssessments + analytics.pendingAssessments) > 0 ? (analytics.completedAssessments / (analytics.completedAssessments + analytics.pendingAssessments)) * 100 : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-300" />
                                            Pending
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {analytics.pendingAssessments} students
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                                        <div
                                            className="bg-orange-600 dark:bg-orange-400 h-2 rounded-full"
                                            style={{
                                                width: `${(analytics.completedAssessments + analytics.pendingAssessments) > 0 ? (analytics.pendingAssessments / (analytics.completedAssessments + analytics.pendingAssessments)) * 100 : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-primary-600" />
                                Team Performance
                            </h3>
                        </CardHeader>
                        <CardBody className="p-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">Excellent</span>
                                    <span className="text-sm font-medium text-green-600 dark:text-green-300">
                                        {analytics.teamPerformance.excellent} teams
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">Good</span>
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                                        {analytics.teamPerformance.good} teams
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">Average</span>
                                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-300">
                                        {analytics.teamPerformance.average} teams
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">Needs Improvement</span>
                                    <span className="text-sm font-medium text-red-600 dark:text-red-300">
                                        {analytics.teamPerformance.needsImprovement} teams
                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Skill Distribution */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-primary-600" />
                            Skill Distribution Across Students
                        </h3>
                    </CardHeader>
                    <CardBody className="p-6">
                        <div className="space-y-4">
                            {Object.entries(analytics.skillDistribution).map(([skill, count]) => (
                                <div key={skill}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{skill}</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{count} students</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                                        <div
                                            className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full"
                                            style={{
                                                width: `${(count / analytics.totalStudents) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Insights */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary-600" />
                            Key Insights
                        </h3>
                    </CardHeader>
                    <CardBody className="p-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                    <strong>Communication Skills:</strong> Most prevalent skill among students ({analytics.skillDistribution['Communication'] || 0}%).
                                    Consider forming teams with diverse communication styles.
                                </p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                                <p className="text-sm text-green-900 dark:text-green-100">
                                    <strong>Assessment Completion:</strong> {analytics.assessmentRate}% of students have completed assessments.
                                    {analytics.pendingAssessments > 0 && ' Send reminders to pending students.'}
                                </p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg">
                                <p className="text-sm text-purple-900 dark:text-purple-100">
                                    <strong>Team Performance:</strong> {analytics.teamPerformance.excellent + analytics.teamPerformance.good} teams performing above average.
                                    Consider sharing best practices from high-performing teams.
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </DashboardLayout>
    );
}
