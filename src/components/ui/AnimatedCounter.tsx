import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export function AnimatedCounter({
    value,
    duration = 1200,
    suffix = '',
    prefix = '',
    className = '',
}: AnimatedCounterProps) {
    const [ref, isVisible] = useIntersectionObserver<HTMLSpanElement>({ triggerOnce: true });
    const count = useAnimatedCounter(value, { duration, enabled: isVisible });

    return (
        <span ref={ref} className={className}>
            {prefix}{count}{suffix}
        </span>
    );
}
