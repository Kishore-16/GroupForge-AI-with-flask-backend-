import { useState, useEffect } from 'react';
import { useAuth } from '../contexts';
import { DashboardLayout } from '../components/layout';
import { Card, CardBody, CardHeader } from '../components/ui';
import { getMetaStats } from '../services/metaService';
import { fetchAllTeams } from '../services/api';
import {
    AlertCircle,
    BarChart3,
    Users,
    Target,
    Activity,
    CheckCircle,
    Clock,
    Sparkles
} from 'lucide-react';

interface AnalyticsData {
    totalStudents: number;
    totalTeams: number;
    assessmentRate: number;
    completedAssessments: number;
    pendingAssessments: number;
    eligibleForTeams: number;
}

export function AnalyticsPage() {
    const { userProfile } = useAuth();
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        totalStudents: 0,
        totalTeams: 0,
        assessmentRate: 0,
        completedAssessments: 0,
        pendingAssessments: 0,
        eligibleForTeams: 0
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

            // Fetch real data from backend
            const [metaStats, teamsData] = await Promise.all([
                getMetaStats(),
                fetchAllTeams()
            ]);

            const { usersCount, assessedUsersCount } = metaStats;
            const pendingAssessments = Math.max(usersCount - assessedUsersCount, 0);
            const assessmentRate = usersCount > 0
                ? Math.round((assessedUsersCount / usersCount) * 100)
                : 0;

            const activeTeams = teamsData.filter(t => t.status === 'active' || t.status === 'completed');

            setAnalytics({
                totalStudents: usersCount,
                totalTeams: activeTeams.length,
                assessmentRate,
                completedAssessments: assessedUsersCount,
                pendingAssessments,
                eligibleForTeams: assessedUsersCount
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
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Analytics Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <BarChart3 className="w-7 h-7" />
                            </div>
                            <span className="text-sm font-semibold uppercase tracking-wide">Detailed Analytics</span>
                        </div>
                        <h1 className="text-4xl font-bold mb-2">
                            Data-Driven Insights 📈
                        </h1>
                        <p className="text-white/90 text-lg max-w-3xl">
                            In-depth analysis of student assessments, team compositions, and formation trends. Use these insights to optimize team balance and student learning outcomes.
                        </p>
                    </div>
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                {/* Summary Cards - Compact */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="group hover:shadow-lg transition-all">
                        <CardBody className="p-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-3">
                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Students</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalStudents}</p>
                        </CardBody>
                    </Card>

                    <Card className="group hover:shadow-lg transition-all">
                        <CardBody className="p-4">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center mb-3">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assessed</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.completedAssessments}</p>
                        </CardBody>
                    </Card>

                    <Card className="group hover:shadow-lg transition-all">
                        <CardBody className="p-4">
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center mb-3">
                                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pending</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.pendingAssessments}</p>
                        </CardBody>
                    </Card>

                    <Card className="group hover:shadow-lg transition-all">
                        <CardBody className="p-4">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-3">
                                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Teams</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalTeams}</p>
                        </CardBody>
                    </Card>
                </div>

                {/* Assessment Funnel Analysis */}
                <Card className="hover:shadow-lg transition-all">
                    <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            Student Assessment Funnel
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">See how many students are progressing through each stage</p>
                    </CardHeader>
                    <CardBody className="p-6">
                        <div className="space-y-4">
                            {/* Total Students */}
                            <div className="flex items-end gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">All Registered Students</span>
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">{analytics.totalStudents}</span>
                                    </div>
                                    <div className="w-full h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md"></div>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="flex justify-center py-2">
                                <div className="text-2xl text-gray-400">↓</div>
                            </div>

                            {/* Completed Assessment */}
                            <div className="flex items-end gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed Assessment</span>
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">{analytics.completedAssessments} ({analytics.assessmentRate}%)</span>
                                    </div>
                                    <div 
                                        className="h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md transition-all" 
                                        style={{ width: `${(analytics.completedAssessments / analytics.totalStudents) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="flex justify-center py-2">
                                <div className="text-2xl text-gray-400">↓</div>
                            </div>

                            {/* Eligible for Teams */}
                            <div className="flex items-end gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Eligible for Team Formation</span>
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">{analytics.eligibleForTeams}</span>
                                    </div>
                                    <div 
                                        className="h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-md transition-all" 
                                        style={{ width: `${(analytics.eligibleForTeams / analytics.totalStudents) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Insight */}
                            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-l-4 border-teal-500">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <strong>Conversion Rate:</strong> {analytics.totalStudents > 0 ? Math.round((analytics.eligibleForTeams / analytics.totalStudents) * 100) : 0}% of registered students have completed assessments and are ready for team formation.
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Team Distribution Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Team Stats */}
                    <Card className="hover:shadow-lg transition-all">
                        <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                Team Distribution
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overview of team formation status</p>
                        </CardHeader>
                        <CardBody className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Teams</span>
                                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analytics.totalTeams}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Team Size</span>
                                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {analytics.completedAssessments > 0 && analytics.totalTeams > 0 
                                            ? Math.round(analytics.completedAssessments / analytics.totalTeams) 
                                            : 0}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Coverage</span>
                                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {analytics.totalStudents > 0 && analytics.totalTeams > 0
                                            ? Math.round((analytics.completedAssessments / analytics.totalStudents) * 100)
                                            : 0}%
                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Recommendations */}
                    <Card className="hover:shadow-lg transition-all">
                        <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                Next Actions
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Recommended steps to optimize your workflow</p>
                        </CardHeader>
                        <CardBody className="p-6">
                            <div className="space-y-3">
                                {analytics.pendingAssessments > 0 && (
                                    <div className="flex gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">1</div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Send Assessment Reminders</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{analytics.pendingAssessments} students still need to complete their assessment</p>
                                        </div>
                                    </div>
                                )}

                                {analytics.eligibleForTeams >= 10 && analytics.totalTeams === 0 && (
                                    <div className="flex gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">2</div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Form First Teams</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">You have {analytics.eligibleForTeams} eligible students. Start team formation now!</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                                        {analytics.pendingAssessments > 0 || (analytics.eligibleForTeams >= 10 && analytics.totalTeams === 0) ? 3 : 2}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Monitor Team Performance</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Track team progress and provide feedback regularly</p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
