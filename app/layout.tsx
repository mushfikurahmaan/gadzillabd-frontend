import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { Spinner } from '@/components/ui';

export const metadata: Metadata = {
  title: 'GADZILLA | Your Ultimate Gadgets & Accessories Destination',
  description: 'Discover the latest gadgets, tech accessories, and smart devices. Shop premium products with amazing deals.',
  icons: {
    icon: [
      { url: '/assets/favicon/gadzilla-favicon16.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: '/assets/favicon/gadzilla-favicon32.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/assets/favicon/gadzilla-favicon48.svg', sizes: '48x48', type: 'image/svg+xml' },
      { url: '/assets/favicon/gadzilla-favicon64.svg', sizes: '64x64', type: 'image/svg+xml' },
      { url: '/assets/favicon/gadzilla-favicon192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/assets/favicon/gadzilla-favicon512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: '/assets/favicon/gadzilla-favicon180.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={
          <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner color="#ff4444" />
          </div>
        }>
          <Header />
        </Suspense>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
