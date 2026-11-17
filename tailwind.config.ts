import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { blue: '#1A73E8', navy: '#14243A', gold: '#C9A86A' },
        ink: '#202124', muted: '#5F6368', line: '#DADCE0', canvas: '#F8F9FA',
      },
      fontFamily: { sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 2px rgba(60,64,67,.08), 0 2px 6px rgba(60,64,67,.05)',
        pop: '0 10px 30px rgba(32,33,36,.18)',
      },
    },
  },
  plugins: [forms],
}
export default config
