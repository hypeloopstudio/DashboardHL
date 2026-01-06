/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#D400FF",
                secondary: "#00E0FF",
                success: "#00FF94",
                "background-light": "#F3F4F6",
                "background-dark": "#050505",
                "surface-dark": "#111111",
                "surface-light": "#FFFFFF",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            backgroundImage: {
                'cyber-gradient': 'linear-gradient(135deg, #D400FF 0%, #00E0FF 100%)',
                'cyber-gradient-subtle': 'linear-gradient(180deg, rgba(212, 0, 255, 0.05) 0%, rgba(0, 224, 255, 0.05) 100%)',
                'glass': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
            }
        },
    },
    plugins: [],
}
