import defaultTheme from 'tailwindcss/defaultTheme.js';

const hexToRgbChannels = (hex) => {
  const normalized = hex.replace('#', '');

  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return `${r} ${g} ${b}`;
  }

  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `${r} ${g} ${b}`;
};

const withOpacity = (hex) => {
  const channels = hexToRgbChannels(hex);
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(${channels})`;
    }
    return `rgb(${channels} / ${opacityValue})`;
  };
};

const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

const createPalette = (entries) =>
  Object.fromEntries(Object.entries(entries).map(([key, value]) => [key, withOpacity(value)]));

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
        display: ['Space Grotesk', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.04em' }],
        'heading-xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading-lg': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'heading-md': ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.005em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body-base': ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.6' }],
        'body-xs': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
      },
      colors: {
        // ============================================================
        // SEMANTIC DESIGN TOKENS - Midnight Aurora Glassmorphism
        // ============================================================
        // Brand palette (indigo/violet base)
        brand: createPalette({
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#8B95FF',
          500: '#6E7BFF',
          600: '#5A66F0',
          700: '#4B54D6',
          800: '#3B43AE',
          900: '#2E3387',
          950: '#1E1B4B',
        }),

        // Accent colors - Cyan/Blue dominant, Indigo secondary, Violet subtle
        accent: {
          cyan: withOpacity('#22D3EE'),      // Primary accent (40%)
          blue: withOpacity('#3B82F6'),       // Secondary accent (40%)
          indigo: withOpacity('#6366F1'),     // Tertiary accent (15%)
          violet: withOpacity('#8B5CF6'),     // Subtle atmospheric (5%)
          magenta: withOpacity('#EC4899'),    // Barely used - status only
        },

        // Status colors
        success: createPalette({
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        }),
        warning: createPalette({
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FBBF24',
          400: '#F59E0B',
          500: '#D97706',
          600: '#B45309',
        }),
        danger: createPalette({
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        }),
        info: createPalette({
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        }),

        // Midnight Navy - Deep Background Scale
        midnight: createPalette({
          50: '#F5F8FC',
          100: '#EAEEF5',
          200: '#D0D9E5',
          300: '#A4B5C7',
          400: '#788AA5',
          500: '#50647A',
          600: '#3A4C6A',
          700: '#253858',
          800: '#1A2641',
          900: '#0F1B32',
          950: '#05070D',
        }),

        // Neutral (grays)
        neutral: createPalette({
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        }),

        // Surface tokens (for cards, panels, elevated elements)
        surface: createPalette({
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        }),

        // Glassmorphism tokens (CSS variable driven)
        glass: v('--c-glass'),
        'glass-bg': 'var(--glass-bg)',
        'glass-bg-strong': 'var(--glass-bg-strong)',
        'glass-border': 'var(--glass-border)',
        'glass-border-strong': 'var(--glass-border-strong)',

        // Semantic UI tokens (CSS variable driven)
        ink: v('--c-ink'),
        muted: v('--c-muted'),
        faint: v('--c-faint'),
        'on-accent': v('--c-on-accent'),
        canvas: v('--c-canvas'),
        hairline: 'var(--c-hairline)',
        'hairline-soft': 'var(--c-hairline-soft)',
        tint: 'var(--c-fill)',
        'tint-strong': 'var(--c-fill-strong)',

        // Text semantic tokens
        'text-primary': v('--c-ink'),
        'text-secondary': v('--c-muted'),
        'text-muted': v('--c-faint'),
        'text-inverse': v('--c-on-accent'),

        // Background semantic tokens
        'bg-primary': v('--c-canvas'),
        'bg-secondary': v('--c-surface-900'),
        'bg-tertiary': v('--c-surface-800'),
        'bg-glass': 'var(--glass-bg)',
        'bg-glass-strong': 'var(--glass-bg-strong)',
        'bg-glass-modal': 'var(--glass-bg-strong)',

        // Border semantic tokens
        'border-primary': 'var(--c-hairline)',
        'border-secondary': 'var(--c-hairline-soft)',
        'border-glass': 'var(--glass-border)',
        'border-glass-strong': 'var(--glass-border-strong)',

        // Shadow semantic tokens
        'shadow-glass': 'var(--shadow-glass)',
        'shadow-glass-lg': 'var(--shadow-glass-lg)',
        'shadow-soft': 'var(--shadow-soft)',
        'shadow-brand': 'var(--shadow-brand)',
        'shadow-brand-strong': 'var(--shadow-brand-strong)',

        // Legacy compatibility mappings
        primary: {
          DEFAULT: '#22D3EE',
          50: '#F0F4FF',
          100: '#E5F0FF',
          200: '#CAE8FF',
          300: '#9FD6FF',
          400: '#78C3FF',
          500: '#58B8FF',
          600: '#22D3EE',
          700: '#16A3BA',
          800: '#0D9488',
          900: '#0F766E',
          950: '#083A51',
        },
        secondary: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#3B82F6',
          700: '#2563EB',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        destructive: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
      },
      boxShadow: {
        soft: '0 14px 48px rgba(2, 4, 10, 0.40)',
        brand: '0 18px 48px rgba(110, 123, 255, 0.30)',
        'brand-strong': '0 30px 70px rgba(123, 93, 255, 0.45)',
        'brand-glow': '0 24px 64px rgba(110, 123, 255, 0.45)',
        'brand-glow-strong': '0 34px 88px rgba(123, 93, 255, 0.55)',
        outline: '0 0 0 2px rgba(110, 123, 255, 0.35)',
        glass: '0 20px 50px rgba(2, 4, 10, 0.45)',
        'glass-lg': '0 30px 80px rgba(2, 4, 10, 0.55)',
        'inner-hi': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },
      borderRadius: {
        pill: '999px',
        control: '1rem',
        card: '1.5rem',
        xl2: '1.75rem',
      },
      transitionTimingFunction: {
        snappy: 'cubic-bezier(0.16, 1, 0.3, 1)',
        soothing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backgroundImage: {
        'mesh-radiant': 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.18) 0%, transparent 55%), radial-gradient(circle at 80% 0%, rgba(34, 211, 238, 0.16) 0%, transparent 60%), radial-gradient(circle at 5% 90%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
        'aurora-primary': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 211, 238, 0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(59, 130, 246, 0.12), transparent)',
        'aurora-secondary': 'radial-gradient(ellipse 50% 30% at 20% 80%, rgba(99, 102, 241, 0.10), transparent)',
      },
      keyframes: {
        aurora: {
          '0%': { transform: 'translate3d(-6%, -4%, 0) rotate(0deg) scale(1.05)' },
          '50%': { transform: 'translate3d(6%, 4%, 0) rotate(8deg) scale(1.15)' },
          '100%': { transform: 'translate3d(-6%, -4%, 0) rotate(0deg) scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(40px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        aurora: 'aurora 22s ease-in-out infinite',
        shimmer: 'shimmer 2.4s infinite linear',
        float: 'float 6s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-up': 'slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};