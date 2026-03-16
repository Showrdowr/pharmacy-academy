import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#014D40",
                    foreground: "#ffffff",
                    50: "#f0fdf9",
                    100: "#cbf7e8",
                    200: "#97eed2",
                    300: "#5adfb8",
                    400: "#27c89a",
                    500: "#0eab80",
                    600: "#068a68",
                    700: "#086f55",
                    800: "#0a5845",
                    900: "#014D40",
                    950: "#002922",
                },
                secondary: {
                    DEFAULT: "#667eea",
                    foreground: "#ffffff",
                },
                border: "#e0e0e0",
                input: "#e0e0e0",
                ring: "#014D40",
                background: "#ffffff",
                foreground: "#1a1a1a",
                muted: {
                    DEFAULT: "#f5f5f5",
                    foreground: "#666666",
                },
                accent: {
                    DEFAULT: "#f5f5f5",
                    foreground: "#014D40",
                },
                destructive: {
                    DEFAULT: "#ef4444",
                    foreground: "#ffffff",
                },
            },
            borderRadius: {
                lg: "12px",
                md: "10px",
                sm: "8px",
            },
            fontFamily: {
                sans: ["THSarabunNew", "sans-serif"],
                heading: ["THSarabunNew", "sans-serif"],
                body: ["THSarabunNew", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;
