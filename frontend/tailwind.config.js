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
                primary: '#3B82F6',
                secondary: '#10B981',
                danger: '#EF4444',
                warning: '#F59E0B',
                dark: '#1F2937',
                light: '#F3F4F6',
            },
            animation: {
                'bounce-short': 'bounce 0.5s ease-in-out 1',
            }
        },
    },
    plugins: [],
}
