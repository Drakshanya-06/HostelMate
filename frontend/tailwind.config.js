/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#8B5CF6', // Violet 500
                    hover: '#7C3AED',   // Violet 600
                },
                secondary: {
                    DEFAULT: '#06B6D4', // Cyan 500
                    hover: '#0891B2',   // Cyan 600
                },
                background: '#020617',  // Deep Slate 950
                surface: '#0F172A',     // Slate 900
                border: '#1E293B',      // Slate 800
                muted: '#334155',       // Slate 700
                textPrimary: '#F8FAFC', // Slate 50
                textSecondary: '#94A3B8',// Slate 400
                success: '#10B981',     // Emerald 500
                warning: '#F59E0B',     // Amber 500
                error: '#EF4444',       // Red 500
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
