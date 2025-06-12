'use client';

import './globals.css';
import { Inter, DM_Sans } from 'next/font/google';
import Footer from '@/components/footer';
import { ToastProvider } from '@/components/ui/toast-provider';
import { UserProvider } from '@/context/UserContext';

// DM Sans as main font
const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

// Using Inter as a fallback for IvyPresto (which requires licensing)
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${dmSans.variable} ${inter.variable} font-sans bg-crudo`}>
        <UserProvider>
          <ToastProvider />
          <main className="min-h-screen flex flex-col">
            {children}
          </main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
