import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			screens: {
				'xs': '480px',
			},
		fontFamily: {
				sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
				display: ['Playfair Display', 'serif'],
				body: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
				'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
				'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
				'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.015em' }],
				'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.02em' }],
				'2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.025em' }],
				'3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.03em' }],
				'4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.035em' }],
				'5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
				'6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.045em' }],
				'7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
				'8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.055em' }],
				'9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.06em' }],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					soft: 'hsl(var(--primary-soft))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					soft: 'hsl(var(--secondary-soft))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				hover: {
					DEFAULT: 'hsl(var(--hover))',
					foreground: 'hsl(var(--hover-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				xs: 'var(--radius-xs)',
				sm: 'var(--radius-sm)',
				DEFAULT: 'var(--radius)',
				lg: 'var(--radius-lg)',
				xl: 'var(--radius-xl)',
			},
			boxShadow: {
				soft: 'var(--shadow-soft)',
				medium: 'var(--shadow-medium)',
				strong: 'var(--shadow-strong)',
				glow: 'var(--shadow-glow)',
				'red-glow': 'var(--shadow-red-glow)',
			},
			transitionTimingFunction: {
				spring: 'var(--ease-spring)',
				smooth: 'var(--ease-smooth)',
			},
			transitionDuration: {
				fast: '150ms',
				normal: '250ms',
				slow: '350ms',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(8px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-up': {
					from: { opacity: '0', transform: 'translateY(24px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					from: { opacity: '0', transform: 'scale(0.95)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},
				'slide-in-right': {
					from: { opacity: '0', transform: 'translateX(24px)' },
					to: { opacity: '1', transform: 'translateX(0)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px) scale(1)' },
					'50%': { transform: 'translateY(-10px) scale(1.05)' }
				},
				'float-delayed': {
					'0%, 100%': { transform: 'translateY(0px) scale(1)' },
					'50%': { transform: 'translateY(-8px) scale(1.03)' }
				},
				'slow-spin': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' }
				},
				'gradient-text': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'pulse-glow': {
					'0%, 100%': { 'box-shadow': '0 0 0 0 hsl(var(--primary) / 0.4)' },
					'50%': { 'box-shadow': '0 0 0 10px hsl(var(--primary) / 0)' }
				},
				'scroll': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-50%)' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'twinkle': {
					'0%, 100%': { opacity: '0', transform: 'scale(0.8)' },
					'50%': { opacity: '1', transform: 'scale(1.2)' }
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'glow': {
					'0%, 100%': { filter: 'brightness(1) drop-shadow(0 0 5px currentColor)' },
					'50%': { filter: 'brightness(1.2) drop-shadow(0 0 20px currentColor)' }
				},
				'fade-out': {
					from: { opacity: '1', transform: 'translateY(0)' },
					to: { opacity: '0', transform: 'translateY(-8px)' }
				},
				'scale-out': {
					from: { opacity: '1', transform: 'scale(1)' },
					to: { opacity: '0', transform: 'scale(0.95)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.3s var(--ease-smooth)',
				'accordion-up': 'accordion-up 0.3s var(--ease-smooth)',
				'fade-in': 'fade-in 0.5s var(--ease-smooth)',
				'fade-in-up': 'fade-in-up 0.6s var(--ease-smooth)',
				'scale-in': 'scale-in 0.3s var(--ease-spring)',
				'slide-in-right': 'slide-in-right 0.4s var(--ease-smooth)',
				'float': 'float 3s ease-in-out infinite',
				'float-delayed': 'float-delayed 4s ease-in-out infinite',
				'slow-spin': 'slow-spin 20s linear infinite',
				'gradient-text': 'gradient-text 3s ease-in-out infinite',
				'twinkle-delayed': 'twinkle 2s ease-in-out infinite 1s',
				'pulse-glow': 'pulse-glow 2s infinite',
				'scroll': 'scroll 30s linear infinite',
				'shimmer': 'shimmer 2s infinite',
				'twinkle': 'twinkle 2s ease-in-out infinite',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'fade-out': 'fade-out 0.3s ease-out forwards',
				'scale-out': 'scale-out 0.2s ease-out forwards'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
