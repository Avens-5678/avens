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
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Playfair Display', 'serif'],
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
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-6px)' }
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
				'pulse-glow': 'pulse-glow 2s infinite',
				'scroll': 'scroll 30s linear infinite',
				'shimmer': 'shimmer 2s infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
