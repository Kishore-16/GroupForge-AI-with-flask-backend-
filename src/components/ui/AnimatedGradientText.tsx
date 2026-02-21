import { cn } from '../../lib/utils';

interface AnimatedGradientTextProps {
    children: React.ReactNode;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'span' | 'p';
}

export function AnimatedGradientText({
    children,
    className,
    as: Tag = 'h1',
}: AnimatedGradientTextProps) {
    return (
        <Tag
            className={cn(
                'gradient-text-vivid font-bold',
                className
            )}
        >
            {children}
        </Tag>
    );
}
