import { Link } from 'react-router-dom';
import { Button, ThemeToggle, FloatingParticles, AnimatedGradientText } from '../components/ui';
import { Hyperspeed } from '../components/effects/Hyperspeed';
import { useTheme } from '../contexts';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import {
    Users,
    Brain,
    Target,
    Sparkles,
    ArrowRight,
    BarChart3,
    Shield,
    Zap
} from 'lucide-react';

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>();
    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

export function LandingPage() {
    const features = [
        {
            icon: Brain,
            title: 'AI-Powered Assessments',
            description: 'Adaptive skill evaluations using Google Gemini that measure real abilities, not self-reported claims.',
        },
        {
            icon: Target,
            title: 'Intelligent Matching',
            description: 'Form balanced teams based on leadership, creativity, analytical thinking, and execution strength.',
        },
        {
            icon: BarChart3,
            title: 'Data-Driven Insights',
            description: 'Faculty dashboards with analytics on team composition, skill distribution, and formation quality.',
        },
        {
            icon: Shield,
            title: 'Fair & Objective',
            description: 'Eliminate bias and favoritism. Every team member is placed based on verified capabilities.',
        },
    ];

    const problems = [
        { text: 'Random or biased team formation', icon: '🎲' },
        { text: 'Proxy participation and "free riders"', icon: '👻' },
        { text: 'Uneven workload distribution', icon: '⚖️' },
        { text: 'High-performers carrying disengaged teammates', icon: '😩' },
    ];

    const { theme } = useTheme();

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
            {/* Hyperspeed Background - Only in Dark Mode */}
            {theme === 'dark' && (
                <div className="fixed inset-0 z-0">
                    <Hyperspeed />
                </div>
            )}

            {/* Content wrapper */}
            <div className="relative z-10">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 glass z-50 border-b border-gray-100 dark:border-gray-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 animate-float">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-bold text-xl text-gray-900 dark:text-white">GroupForge AI</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <ThemeToggle />
                                <Link to="/login">
                                    <Button variant="ghost">Sign in</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button>Get Started</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative pt-32 pb-24 px-4 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-950/0 dark:via-gray-900/0 dark:to-gray-950/0">
                    <FloatingParticles count={30} />
                    <div className="max-w-7xl mx-auto text-center relative">
                        <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-8 border border-transparent dark:border-primary-800 animate-bounce-in">
                                <Sparkles className="w-4 h-4" />
                                Powered by Google Gemini AI
                            </div>
                        </div>

                        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
                                Form Teams That
                                <br />
                                <AnimatedGradientText as="span" className="text-5xl md:text-7xl">
                                    Actually Work
                                </AnimatedGradientText>
                            </h1>
                        </div>

                        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                                GroupForge AI uses intelligent skill assessments to create balanced, complementary
                                student teams. No more guesswork, favoritism, or free riders.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <Link to="/signup">
                                <Button size="lg" className="group shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all">
                                    Start Free
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg" className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                Watch Demo
                            </Button>
                        </div>

                        {/* Animated Hero Mockup */}
                        <div className="mt-20 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-1 shadow-2xl shadow-black/30">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 via-violet-500 to-accent-500 rounded-2xl opacity-20 blur-sm animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
                                <div className="relative bg-gray-900 rounded-2xl p-6 md:p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                                        </div>
                                        <div className="text-gray-500 text-sm font-mono">Team Formation Dashboard</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-gray-800/80 rounded-xl p-5 border border-gray-700/50 hover:border-primary-500/30 transition-colors duration-500">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-lg shadow-primary-500/30" />
                                                    <div className="text-white font-semibold">Team {i}</div>
                                                </div>
                                                <div className="space-y-3">
                                                    {[85, 72, 60].map((width, j) => (
                                                        <div key={j} className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${j === 0 ? 'bg-primary-500' : j === 1 ? 'bg-accent-500' : 'bg-violet-500'}`}
                                                                style={{
                                                                    width: `${width}%`,
                                                                    animation: `drawLine 1.2s ease-out ${0.8 + i * 0.2 + j * 0.15}s both`,
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4 flex items-center gap-1">
                                                    {[0, 1, 2, 3].map(k => (
                                                        <div
                                                            key={k}
                                                            className="w-6 h-6 rounded-full bg-gray-600 border-2 border-gray-800 -ml-1 first:ml-0"
                                                            style={{ animation: `scaleIn 0.3s ease-out ${1.5 + i * 0.1 + k * 0.1}s both` }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Problem Section */}
                <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50 relative">
                    <div className="max-w-7xl mx-auto">
                        <RevealSection className="text-center mb-14">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                The Problem with Traditional Group Formation
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Academic group projects often fail not because of the work itself,
                                but because teams are formed poorly.
                            </p>
                        </RevealSection>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {problems.map((problem, i) => (
                                <RevealSection key={i} delay={i * 100}>
                                    <div className="group bg-white dark:bg-gray-800/60 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full" style={{ perspective: '1000px' }}>
                                        <div className="text-3xl mb-4">{problem.icon}</div>
                                        <p className="text-gray-700 dark:text-gray-300 font-medium">{problem.text}</p>
                                    </div>
                                </RevealSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 px-4 relative">
                    <div className="max-w-7xl mx-auto">
                        <RevealSection className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                How GroupForge AI Works
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Replace guesswork with intelligence, and group chaos with structured collaboration.
                            </p>
                        </RevealSection>

                        <div className="grid md:grid-cols-2 gap-6">
                            {features.map((feature, i) => {
                                const Icon = feature.icon;
                                return (
                                    <RevealSection key={i} delay={i * 100}>
                                        <div className="group flex gap-6 p-6 rounded-2xl bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300 hover:shadow-xl dark:hover:shadow-primary-500/5 hover:-translate-y-1 h-full">
                                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                                            </div>
                                        </div>
                                    </RevealSection>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Process Section */}
                <section className="py-24 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 aurora-bg opacity-90" />
                    <div className="absolute inset-0 bg-gray-900/60" />
                    <FloatingParticles count={15} className="z-0" />
                    <div className="max-w-7xl mx-auto relative z-10">
                        <RevealSection className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple 3-Step Process</h2>
                            <p className="text-lg text-primary-200">Get started in minutes</p>
                        </RevealSection>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { step: '01', title: 'Students Complete Assessment', desc: 'Short, AI-powered skill evaluation across key dimensions', icon: Brain },
                                { step: '02', title: 'AI Analyzes & Matches', desc: 'Gemini processes skills and forms balanced, complementary teams', icon: Zap },
                                { step: '03', title: 'Teams Get to Work', desc: 'Students see their teams with insights on strengths and roles', icon: Users },
                            ].map((item, i) => {
                                const StepIcon = item.icon;
                                return (
                                    <RevealSection key={i} delay={i * 150}>
                                        <div className="text-center group">
                                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                                                <StepIcon className="w-9 h-9 text-white" />
                                            </div>
                                            <div className="text-5xl font-bold text-white/20 mb-3 font-mono">{item.step}</div>
                                            <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                                            <p className="text-primary-200/80">{item.desc}</p>
                                        </div>
                                    </RevealSection>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 px-4 relative">
                    <FloatingParticles count={10} />
                    <RevealSection className="max-w-4xl mx-auto text-center relative">
                        <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-3xl p-12 md:p-16 border border-primary-100 dark:border-gray-700">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Ready to Transform Group Work?
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                                Join institutions that are already using GroupForge AI to create better teams.
                            </p>
                            <Link to="/signup">
                                <Button size="lg" className="group shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all">
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </RevealSection>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12 px-4 border-t border-gray-800">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-bold text-white">GroupForge AI</span>
                            </div>
                            <p className="text-sm">© 2025 GroupForge AI. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
