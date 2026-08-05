/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        paper: '#F5F5F0',
        accent: '#D91C2A',
        // "Campus Bulletin" warmth palette — introduced on the homepage first,
        // see design study: https://claude.ai/code/artifact/893d1c9f-68c8-45f2-ba3b-ac78da5df44f
        cream: '#F6F1E4',
        charcoal: '#23201D',
        poppy: '#E2402F',
        marigold: '#F0A93D',
        sky: '#6FA3B0',
      },
      fontFamily: {
        display: ['"Unbounded"', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
};
