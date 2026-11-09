import localFont from 'next/font/local';

// Self-hosted (no Google Fonts). Sources and licenses: public/fonts/*-OFL.txt, README.md.
export const vazirmatn = localFont({
  src: '../../public/fonts/Vazirmatn-Variable.woff2',
  weight: '100 900',
  variable: '--font-fa',
  display: 'swap',
  preload: true,
  fallback: ['Tahoma', 'system-ui', 'sans-serif'],
});

export const inter = localFont({
  src: '../../public/fonts/Inter-Variable-latin.woff2',
  weight: '100 900',
  variable: '--font-en',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
});
