/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        brand: '#050314',
        background: '#ffffff',
        foreground: '#111827',
        card: { DEFAULT: '#ffffff', foreground: '#111827' },
        primary: { DEFAULT: '#030213', foreground: '#ffffff' },
        muted: { DEFAULT: '#ececf0', foreground: '#717182' },
        accent: { DEFAULT: '#e9ebef', foreground: '#030213' },
        destructive: { DEFAULT: '#d4183d', foreground: '#ffffff' },
        border: '#e5e7eb',
        'input-background': '#f3f3f5',
        ring: '#9ca3af',
        sidebar: {
          DEFAULT: '#f9fafb',
          foreground: '#374151',
          primary: { DEFAULT: '#030213', foreground: '#f9fafb' },
          accent: { DEFAULT: '#f3f4f6', foreground: '#1c1917' },
          border: '#e4e4e7',
        },
      },
    },
  },
  plugins: [],
}
