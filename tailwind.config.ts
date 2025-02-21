/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from "tailwindcss";

const config = {
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
				sm: '640px',
				md: '768px',
				mlg: '900px',
				lg: '1024px',
				xl: '1164px',
				'2xl': '1164px'
			}
    	},
		screens: {
			xs: '375px',
			sm: '640px',
			md: '768px',
			mlg: '900px',
			lg: '1024px',
			xl: '1280px',
			'2xl': '1536px'
		},
    	extend: {
    		colors: {
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
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
				neutral: {
					primary: {
						text: '#0D0D0D'
					},
					text: {
						disable: '#C5C2C5',
						secondary: '#737073'
					},
					border: '#E5E3E5',
					background: '#F9F7F9',
					divider: '#F1EFF1'
				},
    			brand: {
    				DEFAULT: 'hsl(var(--brand))',
    				foreground: 'hsl(var(--brand-foreground))'
    			},
    			highlight: {
    				DEFAULT: 'hsl(var(--highlight))',
    				foreground: 'hsl(var(--highlight-foreground))'
    			}
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
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		screens: {
    			'main-hover': {
    				raw: '(hover: hover)'
    			}
    		},
			fontSize: {
				'display-b-56': [
					'56px',
					{
						lineHeight: '120%',
						fontWeight: '700'
					}
				],
				'display-b-42': [
					'42px',
					{
						lineHeight: '120%',
						fontWeight: '700'
					}
				],
				'display-b-36': [
					'36px',
					{
						lineHeight: '120%',
						fontWeight: '700'
					}
				],
				'display-b-32': [
					'32px',
					{
						lineHeight: '120%',
						fontWeight: '700'
					}
				],
				'display-m-56': [
					'56px',
					{
						lineHeight: '120%',
						fontWeight: '500'
					}
				],
				'display-m-42': [
					'42px',
					{
						lineHeight: '120%',
						fontWeight: '500'
					}
				],
				'display-m-36': [
					'36px',
					{
						lineHeight: '120%',
						fontWeight: '500'
					}
				],
				'display-m-32': [
					'32px',
					{
						lineHeight: '120%',
						fontWeight: '500'
					}
				],
				'display-r-56': [
					'56px',
					{
						lineHeight: '120%',
						fontWeight: '400'
					}
				],
				'display-r-42': [
					'42px',
					{
						lineHeight: '120%',
						fontWeight: '400'
					}
				],
				'display-r-36': [
					'36px',
					{
						lineHeight: '120%',
						fontWeight: '400'
					}
				],
				'display-r-32': [
					'32px',
					{
						lineHeight: '120%',
						fontWeight: '400'
					}
				],
				'heading-b-28': [
					'28px',
					{
						lineHeight: '130%',
						fontWeight: '700'
					}
				],
				'heading-b-24': [
					'24px',
					{
						lineHeight: '140%',
						fontWeight: '700'
					}
				],
				'heading-b-20': [
					'20px',
					{
						lineHeight: '140%',
						fontWeight: '700'
					}
				],
				'heading-m-28': [
					'28px',
					{
						lineHeight: '130%',
						fontWeight: '500'
					}
				],
				'heading-m-24': [
					'24px',
					{
						lineHeight: '140%',
						fontWeight: '500'
					}
				],
				'heading-m-20': [
					'20px',
					{
						lineHeight: '140%',
						fontWeight: '500'
					}
				],
				'heading-r-28': [
					'28px',
					{
						lineHeight: '130%',
						fontWeight: '400'
					}
				],
				'heading-r-24': [
					'24px',
					{
						lineHeight: '140%',
						fontWeight: '400'
					}
				],
				'heading-r-20': [
					'20px',
					{
						lineHeight: '140%',
						fontWeight: '400'
					}
				],
				'title-b-18': [
					'18px',
					{
						lineHeight: '150%',
						fontWeight: '700'
					}
				],
				'title-m-18': [
					'18px',
					{
						lineHeight: '150%',
						fontWeight: '500'
					}
				],
				'title-r-18': [
					'18px',
					{
						lineHeight: '150%',
						fontWeight: '400'
					}
				],
				'subheader-b-16': [
					'16px',
					{
						lineHeight: '150%',
						fontWeight: '700'
					}
				],
				'subheader-m-16': [
					'16px',
					{
						lineHeight: '150%',
						fontWeight: '500'
					}
				],
				'subheader-r-16': [
					'16px',
					{
						lineHeight: '150%',
						fontWeight: '400'
					}
				],
				'paragraph-b-14': [
					'14px',
					{
						lineHeight: '150%',
						fontWeight: '700'
					}
				],
				'paragraph-m-14': [
					'14px',
					{
						lineHeight: '150%',
						fontWeight: '500'
					}
				],
				'paragraph-r-14': [
					'14px',
					{
						lineHeight: '150%',
						fontWeight: '400'
					}
				],
				'metadata-b-12': [
					'12px',
					{
						lineHeight: '150%',
						fontWeight: '700'
					}
				],
				'metadata-b-10': [
					'10px',
					{
						lineHeight: '150%',
						fontWeight: '700'
					}
				],
				'metadata-m-12': [
					'12px',
					{
						lineHeight: '150%',
						fontWeight: '500'
					}
				],
				'metadata-m-10': [
					'10px',
					{
						lineHeight: '150%',
						fontWeight: '500'
					}
				],
				'metadata-r-12': [
					'12px',
					{
						lineHeight: '150%',
						fontWeight: '400'
					}
				],
				'metadata-r-10': [
					'10px',
					{
						lineHeight: '150%',
						fontWeight: '400'
					}
				]
			}
    	}
    },
	plugins: [
		require("tailwindcss-animate"),
		require("tailwind-scrollbar-hide")
	],
} satisfies Config;

export default config;
