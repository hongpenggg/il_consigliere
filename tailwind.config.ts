import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'secondary-fixed': '#ffe088',
        'surface-tint': '#ffb4ac',
        'on-error-container': '#ffdad6',
        'surface-bright': '#393939',
        'tertiary-fixed-dim': '#c9c7bc',
        'on-surface': '#e5e2e1',
        'surface-container-lowest': '#0e0e0e',
        'on-secondary-container': '#342800',
        'inverse-on-surface': '#313030',
        'error': '#ffb4ab',
        'on-primary-fixed-variant': '#8f0e12',
        'outline-variant': '#5a403c',
        'on-primary-container': '#ff9085',
        'primary-container': '#89070e',
        'inverse-surface': '#e5e2e1',
        'primary-fixed-dim': '#ffb4ac',
        'primary': '#ffb4ac',
        'on-secondary': '#3c2f00',
        'surface-variant': '#353534',
        'inverse-primary': '#b22a27',
        'tertiary-fixed': '#e5e2d8',
        'on-error': '#690005',
        'tertiary': '#c9c7bc',
        'secondary-container': '#af8d11',
        'surface-container-low': '#1c1b1b',
        'on-background': '#e5e2e1',
        'outline': '#aa8984',
        'on-tertiary-container': '#b1afa5',
        'tertiary-container': '#43433b',
        'secondary-fixed-dim': '#e9c349',
        'primary-fixed': '#ffdad6',
        'background': '#131313',
        'on-tertiary-fixed': '#1c1c15',
        'surface-container-high': '#2a2a2a',
        'on-tertiary-fixed-variant': '#48473f',
        'surface-container': '#201f1f',
        'on-secondary-fixed': '#241a00',
        'surface-dim': '#131313',
        'surface': '#131313',
        'on-secondary-fixed-variant': '#574500',
        'secondary': '#e9c349',
        'on-tertiary': '#31312a',
        'on-primary-fixed': '#410002',
        'surface-container-highest': '#353534',
        'on-primary': '#690006',
        'on-surface-variant': '#e3beb8',
        'error-container': '#93000a'
      },
      fontFamily: {
        headline: ['Newsreader', 'serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Space Grotesk', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: '0px',
        lg: '0px',
        xl: '0px',
        full: '9999px'
      }
    }
  },
  plugins: []
}

export default config
