import type { Config } from "tailwindcss";

export default {
	darkMode: "class",
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
			width: {
				'70': '17.5rem', // 280px
			},
			colors: {
				// Design System Tokens
				primary: {
					50:  '#f2f5f6',
					500: '#415e6b',
					600: '#3a5360',
					700: '#2e4652',
				},
				accent: {
					50:  '#f3f7f8',
					500: '#9bb6bc',
					600: '#87a2a8',
				},
				bg:      '#F5F5F7', /* Subtle gray background */
				surface: '#FFFFFF', /* Bright white */
				border:  '#DADCE0', /* Darker border */
				text:    '#111827',
				muted:   '#6B7280',
				success: '#10B981',
				warning: '#F59E0B',
				error:   '#EF4444',
				info:    '#3B82F6',
				
				// Company brand colors with AI design system
				company: {
					primary: 'hsl(var(--company-primary))',
					secondary: 'hsl(var(--company-secondary))',
					tertiary: 'hsl(var(--company-tertiary))',
					warning: 'hsl(var(--company-warning))',
					error: 'hsl(var(--company-error))',
				},
				// Risk assessment colors
				risk: {
					high: 'hsl(var(--risk-high))',
					medium: 'hsl(var(--risk-medium))',
					low: 'hsl(var(--risk-low))',
					none: 'hsl(var(--risk-none))',
				},
				// InterioApp Brand Colors (legacy support)
				brand: {
					primary: '#415e6b',
					secondary: '#9bb6bc',
					accent: '#733341',
					neutral: '#575656',
					light: '#ffffff'
				},
				// Keep existing shadcn colors for compatibility
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
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
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				document: {
					DEFAULT: 'hsl(var(--document))',
					foreground: 'hsl(var(--document-foreground))'
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
				sm: '6px',
				md: '8px',
				lg: '12px',
				pill: '9999px',
				// Keep existing shadcn radius for compatibility
				'radius-lg': 'var(--radius)',
				'radius-md': 'calc(var(--radius) - 2px)',
				'radius-sm': 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				sm: 'none',
				md: 'none',
				lg: 'none',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'wave': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'hover-lift': {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(-2px)' }
				},
				'interactive-bounce': {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.02)' },
					'100%': { transform: 'scale(1)' }
				},
				'sparkle-minute': {
					'0%, 96%, 100%': { opacity: '0', transform: 'scale(0.85)' },
					'97%': { opacity: '0.35', transform: 'scale(0.95)' },
					'98%': { opacity: '0.8', transform: 'scale(1)' },
					'99%': { opacity: '0.35', transform: 'scale(0.95)' }
				},
				'logo-sweep': {
					'0%': { transform: 'translateX(-120%) rotate(12deg)', opacity: '0' },
					'10%': { opacity: '0.35' },
					'50%': { opacity: '0.6' },
					'90%': { opacity: '0.35' },
					'100%': { transform: 'translateX(120%) rotate(12deg)', opacity: '0' }
				},
				'header-sweep': {
					'0%': { transform: 'translateX(-120%) rotate(12deg)', opacity: '0' },
					'10%': { opacity: '0.25' },
					'50%': { opacity: '0.45' },
					'90%': { opacity: '0.2' },
					'100%': { transform: 'translateX(120%) rotate(12deg)', opacity: '0' }
				},
				'ai-sweep': {
					'0%': { transform: 'translateX(-120%) rotate(12deg)', opacity: '0' },
					'20%': { opacity: '0.5' },
					'60%': { opacity: '0.9' },
					'85%': { opacity: '0.45' },
					'100%': { transform: 'translateX(130%) rotate(12deg)', opacity: '0' }
				},
				'underline-flash': {
					'0%, 100%': { opacity: '0', transform: 'scaleX(0)' },
					'40%': { opacity: '0.9', transform: 'scaleX(1.05)' },
					'60%': { opacity: '0.7', transform: 'scaleX(1)' }
				},
				'stars-travel': {
					'0%': { transform: 'translateX(-20%) scale(0.85)', opacity: '0' },
					'20%': { opacity: '0.6' },
					'60%': { opacity: '0.9' },
					'100%': { transform: 'translateX(120%) scale(1.05)', opacity: '0' }
				},
				'button-blink': {
					'0%, 100%': { opacity: '0', transform: 'translateY(1px) scale(0.85)' },
					'50%': { opacity: '0.95', transform: 'translateY(0) scale(1.1)' }
				},
				'i-blink-10s': {
					'0%, 97%, 100%': { opacity: '0', transform: 'scale(0.85)' },
					'98%': { opacity: '0.9', transform: 'scale(1.1)' },
					'99%': { opacity: '0.35', transform: 'scale(0.95)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
					'33%': { transform: 'translateY(-20px) translateX(10px)' },
					'66%': { transform: 'translateY(10px) translateX(-10px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'shimmer': 'shimmer 2s ease-in-out infinite',
				'wave': 'wave 2s ease-in-out infinite',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'hover-lift': 'hover-lift 0.2s ease-out',
				'interactive-bounce': 'interactive-bounce 0.15s ease-in-out',
				'sparkle-minute': 'sparkle-minute 60s ease-in-out infinite',
				'logo-sweep': 'logo-sweep 3s ease-in-out both',
				'header-sweep': 'header-sweep 3s ease-in-out both',
				'ai-sweep': 'ai-sweep 1.8s cubic-bezier(0.22,0.61,0.36,1) both',
				'underline-flash': 'underline-flash 0.7s ease-out both',
				'stars-travel': 'stars-travel 3s ease-in-out both',
				'button-blink': 'button-blink 0.6s ease-out both',
				'i-blink-10s': 'i-blink-10s 10s ease-in-out infinite',
				'float': 'float 7s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
