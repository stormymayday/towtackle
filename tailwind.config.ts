import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#e6f1ff",
                    100: "#b3d7ff",
                    500: "#0066cc",
                    900: "#003366",
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
