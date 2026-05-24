import type { Metadata, Viewport } from 'next';

import '@faro/ui/styles.css';

export const metadata: Metadata = {
  title: 'Faro · Gestión bomberil',
  description:
    'Plataforma de gestión para bomberos voluntarios — capturás una vez en la calle y la rendición se arma sola.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Faro',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Faro',
  },
};

export const viewport: Viewport = {
  themeColor: '#0c1e45',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <body className="min-h-dvh bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
