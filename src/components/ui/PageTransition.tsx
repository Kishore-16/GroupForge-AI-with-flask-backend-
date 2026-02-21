import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
    return (
        <div className={cn('animate-fade-in-up', className)}>
            {children}
        </div>
    );
}

interface StaggerChildrenProps {
    children: ReactNode[];
    className?: string;
    staggerMs?: number;
}

export function StaggerChildren({ children, className, staggerMs = 80 }: StaggerChildrenProps) {
    return (
        <>
            {children.map((child, i) => (
                <div
                    key={i}
                    className={cn('animate-fade-in-up', className)}
                    style={{ animationDelay: `${i * staggerMs}ms` }}
                >
                    {child}
                </div>
            ))}
        </>
    );
}
