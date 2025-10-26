import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Modern oklch colors with fallback to hsl for compatibility
      colors: {
        // Modern light theme colors
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.145 0 0)',
        card: 'oklch(1 0 0)',
        'card-foreground': 'oklch(0.145 0 0)',
        popover: 'oklch(1 0 0)',
        'popover-foreground': 'oklch(0.145 0 0)',
        primary: 'oklch(0.205 0 0)',
        'primary-foreground': 'oklch(0.985 0 0)',
        secondary: 'oklch(0.97 0 0)',
        'secondary-foreground': 'oklch(0.205 0 0)',
        muted: 'oklch(0.97 0 0)',
        'muted-foreground': 'oklch(0.556 0 0)',
        accent: 'oklch(0.97 0 0)',
        'accent-foreground': 'oklch(0.205 0 0)',
        destructive: 'oklch(0.577 0.245 27.325)',
        'destructive-foreground': 'oklch(0.985 0 0)',
        border: 'oklch(0.922 0 0)',
        input: 'oklch(0.922 0 0)',
        ring: 'oklch(0.708 0 0)',

        // Chart colors
        'chart-1': 'oklch(0.646 0.222 41.116)',
        'chart-2': 'oklch(0.6 0.118 184.704)',
        'chart-3': 'oklch(0.398 0.07 227.392)',
        'chart-4': 'oklch(0.828 0.189 84.429)',
        'chart-5': 'oklch(0.769 0.188 70.08)',

        // Sidebar colors
        sidebar: 'oklch(0.985 0 0)',
        'sidebar-foreground': 'oklch(0.145 0 0)',
        'sidebar-primary': 'oklch(0.205 0 0)',
        'sidebar-primary-foreground': 'oklch(0.985 0 0)',
        'sidebar-accent': 'oklch(0.97 0 0)',
        'sidebar-accent-foreground': 'oklch(0.205 0 0)',
        'sidebar-border': 'oklch(0.922 0 0)',
        'sidebar-ring': 'oklch(0.708 0 0)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
