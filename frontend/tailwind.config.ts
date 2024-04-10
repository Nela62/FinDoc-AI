import type { Config } from 'tailwindcss';
import { mauve, violet, green, blackA, indigo } from '@radix-ui/colors';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: ['ProseMirror'],
  theme: {
    extend: {
      colors: {
        ...mauve,
        ...violet,
        ...green,
        ...blackA,
        ...indigo,
        'finpanel-yellow': '#F8EC78',
        'finpanel-yellow-light': '#FDF6DD',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
export default config;
