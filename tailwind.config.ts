import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Poppins', 'sans-serif'],
        headline: ['Poppins', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in-up': {
            '0%': {
                opacity: '0',
                transform: 'translateY(10px)',
            },
            '100%': {
                opacity: '1',
                transform: 'translateY(0)',
            },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'move-bus-1': {
            '0%': { transform: 'translate(-20px, 125px) scale(0.9)' },
            '100%': { transform: 'translate(980px, 125px) scale(0.9)' },
        },
        'move-bus-2': {
            '0%': { transform: 'translate(980px, 375px) scaleX(-0.9) scaleY(0.9)' },
            '100%': { transform: 'translate(-20px, 375px) scaleX(-0.9) scaleY(0.9)' },
        },
        'move-bus-3': {
            '0%': { transform: 'translate(490px, -20px) rotate(90deg) scale(0.9)' },
            '100%': { transform: 'translate(490px, 480px) rotate(90deg) scale(0.9)' },
        },
        'cloud-move': {
          '0%, 100%': { transform: 'translateX(-20%)' },
          '50%': { transform: 'translateX(20%)' },
        },
        'star-twinkle': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '0.2', transform: 'scale(0.8)' },
        },
        'sun-spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
        },
        'rain-drop': {
            '0%': { transform: 'translateY(-20px)', opacity: '0' },
            '50%': { opacity: '1' },
            '100%': { transform: 'translateY(20px)', opacity: '0' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'move-bus-1': 'move-bus-1 12s linear infinite',
        'move-bus-2': 'move-bus-2 15s linear infinite -5s',
        'move-bus-3': 'move-bus-3 10s linear infinite -2s',
        'cloud-move': 'cloud-move 6s ease-in-out infinite',
        'star-twinkle': 'star-twinkle 3s ease-in-out infinite',
        'sun-spin': 'sun-spin 20s linear infinite',
        'rain-drop': 'rain-drop 1s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
