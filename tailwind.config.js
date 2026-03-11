/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                luxe: {
                    50: '#fdfbfa',
                    100: '#f9f5f0',
                    200: '#efdfcc',
                    300: '#e3c3a1',
                    400: '#d5a171',
                    500: '#c8864a',
                    600: '#bc703e',
                    700: '#9c5734',
                    800: '#80482f',
                    900: '#673c28',
                    950: '#381e13',
                },
                gold: {
                    light: '#f7dfa4',
                    DEFAULT: '#d4af37',
                    dark: '#997a00',
                },
                charcoal: '#1a1a1a',
            },
            fontFamily: {
                sans: ['Lato', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
                display: ['Playfair Display', 'serif'],
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
