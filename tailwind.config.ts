import forms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        misfits: {
          blood: '#7A0C0C',
          red1: '#A4161A',
          red2: '#BA181B',
          black: '#0D0D0D',
          charcoal: '#161616',
          gray: '#2A2A2A'
        }
      },
      boxShadow: {
        panel: '0 18px 45px rgba(0, 0, 0, 0.35)'
      }
    }
  },
  plugins: [forms]
};

export default config;
