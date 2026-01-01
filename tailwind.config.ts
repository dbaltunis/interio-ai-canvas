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
				// Legacy support - converted to HSL
				bg: '216 20% 97%',
				surface: '0 0% 100%',
				text: '220 15% 15%',
				success: '142 76% 36%',
				error: '0 84% 60%',
				info: '189 40% 65%',
				
				// InterioApp Original Brand Colors - Cool Toned Palette
				brand: {
					primary: 'hsl(var(--brand-dark-teal))',
					'primary-bright': 'hsl(var(--brand-teal-bright))',
					'primary-deep': 'hsl(var(--brand-teal-deep))',
					secondary: 'hsl(var(--brand-sage))',
					'secondary-light': 'hsl(var(--brand-sage-light))',
					'secondary-dark': 'hsl(var(--brand-sage-dark))',
					neutral: '0 2% 34%',
					light: '0 0% 100%'
				},
				// Company colors reference brand colors
				company: {
					primary: 'hsl(var(--brand-dark-teal))',
					secondary: 'hsl(var(--brand-sage))',
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
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
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
				xs: '4px',
				sm: '6px',
				md: '10px',
				lg: '14px',
				xl: '18px',
				'2xl': '24px',
				pill: '9999px',
				// Keep existing shadcn radius for compatibility
				'radius-lg': 'var(--radius)',
				'radius-md': 'calc(var(--radius) - 2px)',
				'radius-sm': 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				xs: '0 1px 2px hsl(var(--foreground) / 0.04)',
				sm: '0 1px 3px hsl(var(--foreground) / 0.06), 0 1px 2px hsl(var(--foreground) / 0.04)',
				md: '0 4px 6px -1px hsl(var(--foreground) / 0.08), 0 2px 4px -2px hsl(var(--foreground) / 0.05)',
				lg: '0 10px 15px -3px hsl(var(--foreground) / 0.08), 0 4px 6px -4px hsl(var(--foreground) / 0.04)',
				xl: '0 20px 25px -5px hsl(var(--foreground) / 0.1), 0 8px 10px -6px hsl(var(--foreground) / 0.05)',
				card: '0 1px 3px hsl(var(--foreground) / 0.04), 0 1px 2px hsl(var(--foreground) / 0.02)',
				'card-hover': '0 4px 12px hsl(var(--foreground) / 0.08), 0 2px 4px hsl(var(--foreground) / 0.04)',
				dropdown: '0 4px 16px -2px hsl(var(--foreground) / 0.12), 0 2px 4px -2px hsl(var(--foreground) / 0.06)',
				modal: '0 24px 48px -12px hsl(var(--foreground) / 0.18), 0 12px 24px -8px hsl(var(--foreground) / 0.08)',
			},
			fontSize: {
				'2xs': ['0.6875rem', { lineHeight: '1rem' }], // 11px
				xs: ['0.8125rem', { lineHeight: '1.125rem' }], // 13px
				sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
				base: ['0.9375rem', { lineHeight: '1.5rem' }], // 15px
				lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
				xl: ['1.375rem', { lineHeight: '1.875rem' }], // 22px
				'2xl': ['1.75rem', { lineHeight: '2.125rem' }], // 28px
				'3xl': ['2rem', { lineHeight: '2.5rem' }], // 32px
			},
			letterSpacing: {
				tighter: '-0.025em',
				tight: '-0.02em',
				normal: '0',
				wide: '0.01em',
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
			},
			transitionDuration: {
				'150': '150ms',
				'200': '200ms',
				'250': '250ms',
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
			},
			'typing-cursor': {
				'0%, 100%': { opacity: '1' },
				'50%': { opacity: '0' }
			},
			'scale-pulse': {
				'0%, 100%': { transform: 'scale(1)' },
				'50%': { transform: 'scale(1.05)' }
			},
			'gradient-shift': {
				'0%, 100%': { backgroundPosition: '0% 50%' },
				'50%': { backgroundPosition: '100% 50%' }
			},
			'float-gentle': {
				'0%, 100%': { transform: 'translateY(0px) scale(1)' },
				'50%': { transform: 'translateY(-20px) scale(1.05)' }
			},
			'pulse-subtle': {
				'0%, 100%': { opacity: '1', transform: 'scale(1)' },
				'50%': { opacity: '0.85', transform: 'scale(1.02)' }
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
			'float': 'float 7s ease-in-out infinite',
			'typing-cursor': 'typing-cursor 1s ease-in-out infinite',
			'scale-pulse': 'scale-pulse 6s ease-in-out infinite',
			'gradient-shift': 'gradient-shift 15s ease infinite',
			'float-gentle': 'float-gentle 8s ease-in-out infinite',
			'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
