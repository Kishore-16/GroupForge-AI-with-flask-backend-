/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#172554',
                },
                accent: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                violet: {
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'fade-in-up': 'fadeInUp 0.5s ease-out both',
                'fade-in-down': 'fadeInDown 0.5s ease-out both',
                'fade-in-left': 'fadeInLeft 0.5s ease-out both',
                'fade-in-right': 'fadeInRight 0.5s ease-out both',
                'scale-in': 'scaleIn 0.4s ease-out both',
                'slide-in': 'slideIn 0.3s ease-out',
                'slide-in-right': 'slide-in-right 0.3s ease-out',
                'bounce-in': 'bounceIn 0.5s ease-out both',
                'spin-slow': 'spinSlow 8s linear infinite',
                'float': 'float 4s ease-in-out infinite',
                'glow-pulse': 'glowPulse 3s ease-in-out infinite',
                'gradient-shift': 'gradientShift 4s ease infinite',
                'aurora': 'aurora 15s ease-in-out infinite',
                'shimmer': 'shimmer 1.5s ease-in-out infinite',
                'draw-line': 'drawLine 1s ease-out both',
                'orbit': 'orbit 20s linear infinite',
                'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0', transform: 'translateY(10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInUp: {
                    from: { opacity: '0', transform: 'translateY(24px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInDown: {
                    from: { opacity: '0', transform: 'translateY(-24px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInLeft: {
                    from: { opacity: '0', transform: 'translateX(-24px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                fadeInRight: {
                    from: { opacity: '0', transform: 'translateX(24px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                scaleIn: {
                    from: { opacity: '0', transform: 'scale(0.92)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
                slideIn: {
                    from: { opacity: '0', transform: 'translateX(-10px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                'slide-in-right': {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                bounceIn: {
                    '0%': { opacity: '0', transform: 'scale(0.3)' },
                    '50%': { transform: 'scale(1.05)' },
                    '70%': { transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                spinSlow: {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 5px hsla(221,83%,53%,0.2), 0 0 20px hsla(221,83%,53%,0.05)' },
                    '50%': { boxShadow: '0 0 15px hsla(221,83%,53%,0.4), 0 0 40px hsla(221,83%,53%,0.1)' },
                },
                gradientShift: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
                aurora: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '25%': { backgroundPosition: '50% 100%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '75%': { backgroundPosition: '50% 0%' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                drawLine: {
                    from: { width: '0' },
                    to: { width: '100%' },
                },
                orbit: {
                    '0%': { transform: 'rotate(0deg) translateX(20px) rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg) translateX(20px) rotate(-360deg)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
                    '50%': { opacity: '0.8', transform: 'scale(1.05)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
