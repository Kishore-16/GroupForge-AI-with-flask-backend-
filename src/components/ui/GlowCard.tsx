import { useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { cn } from '../../lib/utils';

interface GlowCardProps {
    children: ReactNode;
    className?: string;
    glowColor?: string;
}

export function GlowCard({ children, className, glowColor = 'hsla(270,70%,50%,0.2)' }: GlowCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [spotlight, setSpotlight] = useState({ x: 0, y: 0, opacity: 0 });

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;
        setSpotlight({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            opacity: 1,
        });
    };

    const handleMouseLeave = () => {
        setSpotlight(prev => ({ ...prev, opacity: 0 }));
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                'relative overflow-hidden rounded-2xl border border-gray-200 dark:border-purple-500/15 bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl transition-all duration-300 hover:scale-[1.04] hover:shadow-xl dark:hover:shadow-purple-500/30',
                className
            )}
        >
            {/* Spotlight overlay */}
            <div
                className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
                style={{
                    opacity: spotlight.opacity,
                    background: `radial-gradient(350px circle at ${spotlight.x}px ${spotlight.y}px, ${glowColor}, transparent 70%)`,
                }}
            />
            <div className="relative z-20">{children}</div>
        </div>
    );
}
