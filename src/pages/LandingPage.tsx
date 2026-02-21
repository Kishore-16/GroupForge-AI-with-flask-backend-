import { Link } from 'react-router-dom';
import { Button, ThemeToggle, FloatingParticles, AnimatedGradientText } from '../components/ui';
import { Hyperspeed } from '../components/effects/Hyperspeed';
import { useTheme } from '../contexts';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import {
    Users,
    Brain,
    Target,
    Sparkles,
    ArrowRight,
    BarChart3,
    Shield,
    Zap,
    CheckCircle2,
    Star,
    TrendingUp,
    Layers,
    ChevronRight,
} from 'lucide-react';

/* ── Reveal on scroll ──────────────────────────────────── */
function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>();
    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

/* ── Animated stat counter ─────────────────────────────── */
function StatCard({ value, suffix, label, icon: Icon, delay = 0 }: { value: number; suffix: string; label: string; icon: React.ElementType; delay?: number }) {
    const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>();
    const count = useAnimatedCounter(isVisible ? value : 0, { duration: 2000 });
    return (
        <div ref={ref} className="stat-border" style={{ animationDelay: `${delay}ms` }}>
            <div className="glass-card rounded-2xl p-6 text-center h-full relative z-10">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-500 dark:text-primary-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    {Math.round(count)}{suffix}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            </div>
        </div>
    );
}

/* ── Meteors decoration ─────────────────────────────────── */
function Meteors({ count = 6 }: { count?: number }) {
    const { theme } = useTheme();
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={theme === 'dark' ? 'meteor' : 'meteor-light'}
                    style={{
                        top: `${Math.random() * 40}%`,
                        left: `${50 + Math.random() * 50}%`,
                        '--duration': `${2 + Math.random() * 4}s`,
                        '--delay': `${Math.random() * 8}s`,
                        opacity: theme === 'dark' ? 0.6 + Math.random() * 0.4 : 0.3 + Math.random() * 0.3,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}

/* ── Floating orbs for light mode ──────────────────────── */
function LightOrbs() {
    const orbs = [
        { color: 'hsla(221, 83%, 53%, 0.12)', size: 200, top: '10%', left: '15%', duration: '14s', delay: '0s' },
        { color: 'hsla(280, 65%, 55%, 0.10)', size: 160, top: '60%', left: '70%', duration: '18s', delay: '2s' },
        { color: 'hsla(142, 71%, 50%, 0.08)', size: 180, top: '30%', left: '80%', duration: '16s', delay: '4s' },
        { color: 'hsla(250, 70%, 60%, 0.10)', size: 140, top: '70%', left: '20%', duration: '12s', delay: '1s' },
    ];
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none dark:hidden">
            {orbs.map((orb, i) => (
                <div
                    key={i}
                    className="light-orb"
                    style={{
                        background: orb.color,
                        width: orb.size,
                        height: orb.size,
                        top: orb.top,
                        left: orb.left,
                        '--duration': orb.duration,
                        '--delay': orb.delay,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}

/* ── Sparkles for light mode ───────────────────────────── */
function SparkleField({ count = 12 }: { count?: number }) {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none dark:hidden">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="sparkle-dot"
                    style={{
                        top: `${10 + Math.random() * 80}%`,
                        left: `${5 + Math.random() * 90}%`,
                        '--duration': `${2 + Math.random() * 3}s`,
                        '--delay': `${Math.random() * 5}s`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════ */
export function LandingPage() {
    const { theme } = useTheme();

    const features = [
        {
            icon: Brain,
            title: 'AI-Powered Assessments',
            description: 'Adaptive skill evaluations using Google Gemini that measure real abilities, not self-reported claims.',
            gradient: 'from-violet-500 to-primary-500',
        },
        {
            icon: Target,
            title: 'Intelligent Matching',
            description: 'Form balanced teams based on leadership, creativity, analytical thinking, and execution strength.',
            gradient: 'from-primary-500 to-accent-500',
        },
        {
            icon: BarChart3,
            title: 'Data-Driven Insights',
            description: 'Faculty dashboards with analytics on team composition, skill distribution, and formation quality.',
            gradient: 'from-accent-500 to-yellow-500',
        },
        {
            icon: Shield,
            title: 'Fair & Objective',
            description: 'Eliminate bias and favoritism. Every team member is placed based on verified capabilities.',
            gradient: 'from-pink-500 to-violet-500',
        },
    ];

    const problems = [
        { text: 'Random or biased team formation', icon: '🎲', color: 'border-red-500/30' },
        { text: 'Proxy participation and "free riders"', icon: '👻', color: 'border-orange-500/30' },
        { text: 'Uneven workload distribution', icon: '⚖️', color: 'border-yellow-500/30' },
        { text: 'High-performers carrying disengaged teammates', icon: '😩', color: 'border-rose-500/30' },
    ];

    const steps = [
        { step: '01', title: 'Students Complete Assessment', desc: 'Short, AI-powered skill evaluation across key dimensions', icon: Brain },
        { step: '02', title: 'AI Analyzes & Matches', desc: 'Gemini processes skills and forms balanced, complementary teams', icon: Zap },
        { step: '03', title: 'Teams Get to Work', desc: 'Students see their teams with insights on strengths and roles', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
            {/* Hyperspeed Background */}
            {theme === 'dark' && (
                <div className="fixed inset-0 z-0">
                    <Hyperspeed />
                </div>
            )}

            <div className="relative z-10">
                {/* ─── Header ─── */}
                <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 animate-float">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">GroupForge AI</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ThemeToggle />
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Sign in</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button size="sm" className="shadow-lg shadow-primary-500/20">Get Started</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ─── Hero ─── */}
                <section className="relative pt-36 pb-32 px-4 overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
                    <div className="absolute inset-0 light-mesh-bg dark:hidden" />
                    <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-400/10 dark:bg-primary-500/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-3xl" />
                    <LightOrbs />
                    <SparkleField count={15} />
                    <Meteors count={8} />
                    <FloatingParticles count={25} />

                    <div className="max-w-7xl mx-auto text-center relative">
                        {/* Badge */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-100/80 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-10 border border-primary-200 dark:border-primary-800/50 pulse-ring backdrop-blur-sm">
                                <Sparkles className="w-4 h-4 animate-spin-slow" style={{ animationDuration: '6s' }} />
                                Powered by Google Gemini AI
                                <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* Headline */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <h1 className="text-6xl md:text-8xl font-extrabold text-gray-900 dark:text-white mb-8 leading-[1.05] tracking-tight">
                                Form Teams That
                                <br />
                                <AnimatedGradientText as="span" className="text-6xl md:text-8xl">
                                    Actually Work
                                </AnimatedGradientText>
                            </h1>
                        </div>

                        {/* Subheadline */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-14 leading-relaxed">
                                GroupForge AI uses intelligent skill assessments to create balanced, complementary
                                student teams. <span className="text-gray-900 dark:text-white font-medium">No more guesswork, favoritism, or free riders.</span>
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <Link to="/signup">
                                <Button size="lg" className="group shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/35 transition-all px-8 text-base">
                                    Start Free — No Credit Card
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform" />
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg" className="px-8 text-base hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                Watch 2-min Demo
                            </Button>
                        </div>

                        {/* Social proof */}
                        <div className="mt-14 animate-fade-in-up flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-500" style={{ animationDelay: '500ms' }}>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-accent-500" />
                                <span>Free for educators</span>
                            </div>
                            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                            <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span>4.9/5 rating</span>
                            </div>
                            <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                            <div className="flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4 text-primary-500" />
                                <span>10K+ teams formed</span>
                            </div>
                        </div>

                        {/* Dashboard Mockup */}
                        <div className="mt-20 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                            <div className="relative group">
                                {/* Glow behind */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-violet-500 to-accent-500 rounded-2xl opacity-20 dark:opacity-30 blur-lg group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity duration-700 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
                                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-1 shadow-2xl">
                                    <div className="bg-gray-900 rounded-2xl p-6 md:p-8">
                                        {/* Window chrome */}
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 bg-red-500 rounded-full" />
                                                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                                                <div className="w-3 h-3 bg-green-500 rounded-full" />
                                            </div>
                                            <div className="flex-1 h-6 bg-gray-800/80 rounded-lg max-w-xs mx-auto flex items-center justify-center">
                                                <span className="text-gray-500 text-xs font-mono">groupforge.ai/dashboard</span>
                                            </div>
                                        </div>
                                        {/* Cards */}
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { name: 'Alpha Squad', score: 94, color: 'from-primary-500 to-primary-400' },
                                                { name: 'Beta Force', score: 89, color: 'from-violet-500 to-violet-400' },
                                                { name: 'Gamma Unit', score: 91, color: 'from-accent-500 to-accent-400' },
                                            ].map((team, i) => (
                                                <div key={i} className="bg-gray-800/60 rounded-xl p-5 border border-gray-700/40 hover:border-primary-500/30 transition-all duration-500">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className={`w-9 h-9 bg-gradient-to-br ${team.color} rounded-lg shadow-lg`} />
                                                        <div>
                                                            <div className="text-white text-sm font-semibold">{team.name}</div>
                                                            <div className="text-gray-500 text-xs">Score: {team.score}%</div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        {[85, 72, 60, 90].map((width, j) => (
                                                            <div key={j} className="flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full bg-gray-700 flex-shrink-0" />
                                                                <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full bg-gradient-to-r ${team.color}`}
                                                                        style={{
                                                                            width: `${width}%`,
                                                                            animation: `drawLine 1.2s ease-out ${0.8 + i * 0.2 + j * 0.15}s both`,
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Stats ─── */}
                <section className="py-16 px-4 relative border-y border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/30">
                    <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                        <StatCard value={10} suffix="K+" label="Teams Formed" icon={Users} delay={0} />
                        <StatCard value={98} suffix="%" label="Satisfaction Rate" icon={Star} delay={100} />
                        <StatCard value={50} suffix="+" label="Institutions" icon={Layers} delay={200} />
                        <StatCard value={3} suffix="min" label="Setup Time" icon={Zap} delay={300} />
                    </div>
                </section>

                {/* ─── Problem ─── */}
                <section className="py-28 px-4 relative">
                    <SparkleField count={8} />
                    <div className="max-w-7xl mx-auto">
                        <RevealSection className="text-center mb-16">
                            <p className="text-sm font-semibold uppercase tracking-widest text-red-500 dark:text-red-400 mb-3">The Problem</p>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-5 tracking-tight">
                                Traditional Group Formation
                                <br />
                                <span className="text-gray-400 dark:text-gray-500">is Fundamentally Broken</span>
                            </h2>
                            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                                Academic group projects often fail not because of the work itself,
                                but because teams are formed poorly.
                            </p>
                        </RevealSection>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {problems.map((problem, i) => (
                                <RevealSection key={i} delay={i * 100}>
                                    <div className={`glass-card rounded-2xl p-6 h-full border-l-4 ${problem.color} group cursor-default`}>
                                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{problem.icon}</div>
                                        <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{problem.text}</p>
                                    </div>
                                </RevealSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── Features ─── */}
                <section className="py-28 px-4 relative bg-gray-50/50 dark:bg-gray-900/30">
                    <FloatingParticles count={12} />
                    <div className="max-w-7xl mx-auto relative">
                        <RevealSection className="text-center mb-16">
                            <p className="text-sm font-semibold uppercase tracking-widest text-primary-500 dark:text-primary-400 mb-3">The Solution</p>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-5 tracking-tight">
                                How GroupForge AI Works
                            </h2>
                            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                                Replace guesswork with intelligence, and group chaos with structured collaboration.
                            </p>
                        </RevealSection>

                        <div className="grid md:grid-cols-2 gap-6">
                            {features.map((feature, i) => {
                                const Icon = feature.icon;
                                return (
                                    <RevealSection key={i} delay={i * 120}>
                                        <div className="glass-card rounded-2xl p-7 h-full group relative overflow-hidden">
                                            {/* Gradient accent line at top */}
                                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                            <div className="flex gap-5">
                                                <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                                    <Icon className="w-7 h-7 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                                                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </RevealSection>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ─── Process ─── */}
                <section className="py-28 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 aurora-bg opacity-90" />
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
                    <Meteors count={5} />
                    <FloatingParticles count={10} className="z-0" />

                    <div className="max-w-5xl mx-auto relative z-10">
                        <RevealSection className="text-center mb-20">
                            <p className="text-sm font-semibold uppercase tracking-widest text-primary-200 mb-3">How It Works</p>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Simple 3-Step Process</h2>
                            <p className="text-lg text-primary-200/80">Get started in minutes, not hours</p>
                        </RevealSection>

                        <div className="grid md:grid-cols-3 gap-8 relative">
                            {/* Connecting line */}
                            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            {steps.map((item, i) => {
                                const StepIcon = item.icon;
                                return (
                                    <RevealSection key={i} delay={i * 200}>
                                        <div className="text-center group relative">
                                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 group-hover:border-white/30 transition-all duration-500 relative">
                                                <StepIcon className="w-9 h-9 text-white" />
                                                {/* Glow */}
                                                <div className="absolute inset-0 rounded-2xl bg-primary-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            </div>
                                            <div className="text-6xl font-black text-white/10 mb-3 font-mono">{item.step}</div>
                                            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                            <p className="text-primary-200/70 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </RevealSection>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ─── CTA ─── */}
                <section className="py-28 px-4 relative">
                    <FloatingParticles count={8} />
                    <RevealSection className="max-w-4xl mx-auto text-center relative">
                        <div className="relative">
                            {/* Animated border */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 via-violet-500 to-accent-500 rounded-3xl opacity-20 blur-sm animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
                            <div className="relative glass-card rounded-3xl p-14 md:p-20 overflow-hidden">
                                {/* Background blobs */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-3xl" />

                                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-5 tracking-tight relative">
                                    Ready to Transform
                                    <br />
                                    Group Work?
                                </h2>
                                <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto relative">
                                    Join educators who are already using GroupForge AI to create teams that deliver results.
                                </p>
                                <Link to="/signup" className="relative">
                                    <Button size="lg" className="group shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/40 transition-all px-10 text-base">
                                        Get Started Free
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </RevealSection>
                </section>

                {/* ─── Footer ─── */}
                <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12 px-4 border-t border-gray-800">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-violet-500 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-white">GroupForge AI</span>
                            </div>
                            <p className="text-sm text-gray-500">© 2025 GroupForge AI. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
