import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f0f1e',
          surface: '#1a1a2e',
          card: '#16213e',
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)',
        'gradient-vibe': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    },
  },
  plugins: [],
}
export default config
