import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#F0FDF4', 100: '#DCFCE7', 600: '#16A34A', 700: '#15803D' },
        forest: { 800: '#166534', 900: '#14532D' },
        lime: { 400: '#A3E635' },
        water: { 50: '#EFF6FF', 600: '#2563EB' },
        warn: { 50: '#FFFBEB', 500: '#F59E0B' },
        danger: { 50: '#FEF2F2', 600: '#DC2626' },
        ink: { 900: '#0F1F17', 600: '#4B5B52', 400: '#8A988F' },
        line: { 200: '#E3EBE6' },
        surface: { 0: '#FFFFFF', 50: '#F6FAF7' },
      },
      borderRadius: {
        card: '24px',
        frame: '32px',
        input: '16px',
        sm: '12px',
      },
      boxShadow: {
        card: '0 8px 24px -8px rgba(22,163,74,0.18), 0 2px 6px rgba(15,31,23,0.04)',
        float: '0 16px 40px -12px rgba(20,83,45,0.35)',
        focus: '0 0 0 3px rgba(22,163,74,0.35)',
      },
      fontFamily: {
        sans: ['"Montserrat"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Montserrat"', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
};

export default config;

