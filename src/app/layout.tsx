import type { ReactNode } from 'react';
import '@/styles/globals.css';

// <html> and <body> live in app/[locale]/layout.tsx so lang/dir follow the locale.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
