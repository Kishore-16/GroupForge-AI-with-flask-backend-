import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group';

        const variants = {
            primary: 'bg-gradient-to-br from-primary-600 to-primary-700 text-white hover:from-primary-500 hover:to-primary-600 focus:ring-primary-400 dark:from-primary-600 dark:to-primary-700 dark:hover:from-primary-500 dark:hover:to-primary-600 dark:focus:ring-primary-300 shadow-lg dark:shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-105 dark:hover:shadow-primary-500/40',
            secondary: 'bg-gradient-to-br from-accent-600 to-accent-700 text-white hover:from-accent-500 hover:to-accent-600 focus:ring-accent-400 dark:from-accent-600 dark:to-accent-700 dark:hover:from-accent-500 dark:hover:to-accent-600 dark:focus:ring-accent-300 shadow-lg dark:shadow-accent-500/20 hover:shadow-accent-500/40 hover:scale-105 dark:hover:shadow-accent-500/40',
            outline: 'border-2 border-primary-600 text-primary-600 hover:border-primary-500 focus:ring-primary-500 dark:border-primary-400 dark:text-primary-300 dark:hover:border-primary-300 dark:focus:ring-primary-300 dark:hover:bg-primary-500/10 hover:bg-primary-50 transition-all duration-300',
            ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-200 dark:hover:bg-slate-700/50 dark:focus:ring-slate-400 transition-all duration-300 hover:scale-105',
            danger: 'bg-gradient-to-br from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 focus:ring-red-400 shadow-lg hover:shadow-red-500/40 hover:scale-105 transition-all duration-300',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
