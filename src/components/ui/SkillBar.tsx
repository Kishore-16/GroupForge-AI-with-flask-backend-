import { cn } from '../../lib/utils';

interface SkillBarProps {
    label: string;
    score: number;
    confidence: 'low' | 'medium' | 'high';
    showValue?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function SkillBar({ label, score, confidence, showValue = true, size = 'md' }: SkillBarProps) {
    const heights = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
    };

    const getColor = (score: number) => {
        if (score >= 80) return 'bg-gradient-to-r from-accent-500 to-teal-500';
        if (score >= 60) return 'bg-gradient-to-r from-primary-500 to-accent-500';
        if (score >= 40) return 'bg-gradient-to-r from-yellow-500 to-primary-500';
        return 'bg-gradient-to-r from-red-500 to-yellow-500';
    };

    const confidenceStyles = {
        low: 'opacity-60',
        medium: 'opacity-80',
        high: 'opacity-100',
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
                {showValue && (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {score}
                        <span className="text-xs ml-1 text-gray-500 dark:text-gray-400">({confidence})</span>
                    </span>
                )}
            </div>
            <div className={cn('w-full bg-gray-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden', heights[size])}>
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-700 shadow-lg',
                        getColor(score),
                        confidenceStyles[confidence]
                    )}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}

interface SkillRadarProps {
    skills: {
        leadership: number;
        analyticalThinking: number;
        creativity: number;
        executionStrength: number;
        communication?: number;
        teamwork?: number;
    };
}

export function SkillSummaryGrid({ skills }: SkillRadarProps) {
    const skillLabels: Record<string, string> = {
        leadership: 'Leadership',
        analyticalThinking: 'Analytical',
        creativity: 'Creativity',
        executionStrength: 'Execution',
        communication: 'Communication',
        teamwork: 'Teamwork',
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            {Object.entries(skills).map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-gradient-to-br from-primary-600/10 to-accent-600/10 dark:from-purple-600/20 dark:to-teal-600/20 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-purple-500/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">{value}</div>
                    <div className="text-xs text-gray-600 dark:text-slate-300 mt-1">{skillLabels[key] || key}</div>
                </div>
            ))}
        </div>
    );
}
