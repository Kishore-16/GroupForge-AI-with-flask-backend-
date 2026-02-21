import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
    return (
        <div
            className={cn(
                'bg-white/80 dark:bg-slate-900/40 rounded-xl shadow-sm border border-gray-200 dark:border-purple-500/10 overflow-hidden backdrop-blur-xl transition-all duration-300',
                hover && 'hover:shadow-xl dark:hover:shadow-purple-500/20 hover:border-gray-300 dark:hover:border-purple-400/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer',
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('px-6 py-4 border-b border-gray-100 dark:border-purple-500/10', className)}>
            {children}
        </div>
    );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('px-6 py-4 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-purple-500/10', className)}>
            {children}
        </div>
    );
}
