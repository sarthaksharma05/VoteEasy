import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E8510A',
          dark: '#C44208',
          light: '#F5DDD3',
        },
        surface: {
          dark: '#1A1A1A',
          light: '#F5F0EB',
          card: '#FAFAF9',
          white: '#FFFFFF',
        },
        background: "var(--color-bg-light)",
        border: "var(--color-border)",
        input: "var(--color-border-input)",
        foreground: "var(--color-text-primary)",
        muted: "var(--color-text-secondary)",
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
      }
    },
  },
  plugins: [],
};

export default config;
