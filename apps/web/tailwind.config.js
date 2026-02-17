/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    indigo: '#4f46e5', // indigo-600
                    amber: '#d97706',  // amber-600
                    slate: '#f8fafc',  // slate-50
                },
                lavender: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    600: '#7c3aed',
                }
            },
            boxShadow: {
                'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'sidebar': '4px 0 24px -12px rgba(0,0,0,0.1)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
