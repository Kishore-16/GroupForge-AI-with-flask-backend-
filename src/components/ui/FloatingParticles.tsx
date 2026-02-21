import { useMemo } from 'react';

interface FloatingParticlesProps {
    count?: number;
    className?: string;
}

export function FloatingParticles({ count = 20, className = '' }: FloatingParticlesProps) {
    const particles = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 6 + 8,
            delay: Math.random() * 5,
            opacity: Math.random() * 0.3 + 0.05,
        }));
    }, [count]);

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute rounded-full bg-primary-500/30 dark:bg-primary-400/20"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        opacity: p.opacity,
                        animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
                    }}
                />
            ))}
        </div>
    );
}
