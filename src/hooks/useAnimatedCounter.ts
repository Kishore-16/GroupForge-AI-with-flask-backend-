import { useEffect, useState } from 'react';

interface UseAnimatedCounterOptions {
    duration?: number;
    start?: number;
    enabled?: boolean;
}

export function useAnimatedCounter(
    target: number,
    options: UseAnimatedCounterOptions = {}
): number {
    const { duration = 1200, start = 0, enabled = true } = options;
    const [value, setValue] = useState(start);

    useEffect(() => {
        if (!enabled) {
            setValue(start);
            return;
        }

        let startTime: number | null = null;
        let rafId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(start + (target - start) * eased));

            if (progress < 1) {
                rafId = requestAnimationFrame(animate);
            }
        };

        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, [target, duration, start, enabled]);

    return value;
}
