import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import { useTheme } from '../contexts';
import { Button, Input, Card, CardBody, ThemeToggle } from '../components/ui';
import { AuroraBackground } from '../components/ui/aurora-background';
import { Hyperspeed } from '../components/effects/Hyperspeed';
import { Users, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';

function AuthBlobs() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="auth-blob auth-blob-1" style={{ top: '10%', left: '15%' }} />
            <div className="auth-blob auth-blob-2" style={{ top: '60%', right: '10%' }} />
            <div className="auth-blob auth-blob-3" style={{ bottom: '20%', left: '40%' }} />
            <div className="auth-grid-light absolute inset-0" />
        </div>
    );
}

function AuthSparkles() {
    const sparkles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 4,
        size: 4 + Math.random() * 6,
    }));

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {sparkles.map(s => (
                <div
                    key={s.id}
                    className="sparkle-dot"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: s.size,
                        height: s.size,
                        '--duration': `${s.duration}s`,
                        '--delay': `${s.delay}s`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signInWithGoogle, signInWithGitHub, signInWithEmail } = useAuth();
    const navigate = useNavigate();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmail(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            await signInWithGoogle();
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google');
        } finally {
            setLoading(false);
        }
    };

    const handleGitHubLogin = async () => {
        setError('');
        setLoading(true);

        try {
            await signInWithGitHub();
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with GitHub');
        } finally {
            setLoading(false);
        }
    };

    const { theme } = useTheme();
    const isLight = theme !== 'dark';

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4 relative">
            {/* Dark Mode Background */}
            {!isLight && (
                <div className="fixed inset-0 z-0">
                    <Hyperspeed />
                </div>
            )}

            {/* Light Mode Backgrounds */}
            {isLight && (
                <>
                    <div className="fixed inset-0 z-0 pointer-events-none">
                        <AuroraBackground className="h-full w-full bg-white" showRadialGradient={true}>
                            <div />
                        </AuroraBackground>
                    </div>
                    <AuthBlobs />
                    <AuthSparkles />
                </>
            )}

            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-20">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8 animate-fadeInDown">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-4 shadow-lg shadow-primary-500/20 ${isLight ? 'auth-logo-light' : ''}`}>
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GroupForge AI</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
                        {isLight && <Sparkles className="w-3.5 h-3.5 text-primary-400 animate-subtlePulse" />}
                        Intelligent Team Formation
                        {isLight && <Sparkles className="w-3.5 h-3.5 text-accent-400 animate-subtlePulse" />}
                    </p>
                </div>

                <div className={`animate-fadeInUp ${isLight ? 'auth-card-light' : ''}`}>
                    <Card className={isLight ? '!bg-transparent !border-0 !shadow-none' : ''}>
                        <CardBody className="p-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Sign in to your account</h2>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm animate-scaleIn">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                <div className="auth-field-enter delay-100">
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@university.edu"
                                        required
                                    />
                                </div>

                                <div className="relative auth-field-enter delay-200">
                                    <Input
                                        label="Password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between auth-field-enter delay-300">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-primary-600 bg-white dark:bg-gray-800" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                                    </label>
                                    <Link to="/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 animated-underline">
                                        Forgot password?
                                    </Link>
                                </div>

                                <div className="auth-field-enter delay-400">
                                    <Button type="submit" className="w-full relative overflow-hidden" isLoading={loading}>
                                        {isLight && <span className="absolute inset-0 auth-btn-shimmer" />}
                                        <span className="relative z-10 flex items-center justify-center">
                                            Sign in
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </span>
                                    </Button>
                                </div>
                            </form>

                            <div className="relative my-6 auth-field-enter delay-500">
                                <div className="absolute inset-0 flex items-center">
                                    {isLight ? (
                                        <div className="w-full h-px auth-divider-light" />
                                    ) : (
                                        <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                                    )}
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400" style={isLight ? { background: 'transparent', backdropFilter: 'blur(8px)' } : undefined}>
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 auth-field-enter delay-600">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className={isLight ? 'auth-social-btn-light' : ''}
                                >
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Google
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGitHubLogin}
                                    disabled={loading}
                                    className={isLight ? 'auth-social-btn-light' : ''}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                    </svg>
                                    GitHub
                                </Button>
                            </div>

                            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 auth-field-enter delay-700">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium animated-underline">
                                    Sign up
                                </Link>
                            </p>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}