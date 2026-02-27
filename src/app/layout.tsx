import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import MetaPixelProvider from '@/components/MetaPixelProvider';
import { WishlistProvider } from '@/context/WishlistContext';

export const metadata: Metadata = {
  title: 'GADZILLA | Your Ultimate Gadgets & Accessories Destination',
  description: 'Discover the latest gadgets, tech accessories, and smart devices. Shop premium products with amazing deals.',
  icons: {
    icon: [
      { url: '/assets/favicon/gadzillabd-favicon-16.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: '/assets/favicon/gadzillabd-favicon-32.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/assets/favicon/gadzillabd-favicon-48.svg', sizes: '48x48', type: 'image/svg+xml' },
      { url: '/assets/favicon/gadzillabd-favicon-64.svg', sizes: '64x64', type: 'image/svg+xml' },
      { url: '/assets/favicon/gadzillabd-favicon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/assets/favicon/gadzillabd-favicon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: '/assets/favicon/gadzillabd-favicon-180.svg',
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
        <MetaPixelProvider />
        <WishlistProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </WishlistProvider>
        <Analytics />
      </body>
    </html>
  );
}
