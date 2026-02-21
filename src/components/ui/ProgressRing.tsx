import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface ProgressRingProps {
    value: number;       // 0-100
    size?: number;
    strokeWidth?: number;
    className?: string;
    label?: string;
    color?: string;
}

export function ProgressRing({
    value,
    size = 80,
    strokeWidth = 6,
    className = '',
    label,
    color,
}: ProgressRingProps) {
    const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({ triggerOnce: true });
    const animatedValue = useAnimatedCounter(value, { duration: 1000, enabled: isVisible });

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedValue / 100) * circumference;

    const strokeColor = color || (
        value >= 80 ? 'hsl(142, 71%, 45%)' :
        value >= 50 ? 'hsl(221, 83%, 53%)' :
        'hsl(38, 92%, 50%)'
    );

    return (
        <div ref={ref} className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-gray-200 dark:text-gray-700"
                />
                {/* Progress arc */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-[stroke-dashoffset] duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-sm font-bold text-gray-900 dark:text-white">{animatedValue}%</span>
                {label && <span className="text-[10px] text-gray-500 dark:text-gray-400">{label}</span>}
            </div>
        </div>
    );
}
