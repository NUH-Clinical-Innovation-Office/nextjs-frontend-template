import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { TelemetryProvider } from '@/components/providers/telemetry-provider';
import { Toaster } from '@/components/ui/sonner';
// Import env to validate environment variables on application startup
import '@/lib/env';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Client Sample',
  description: 'Sample Next.js client that calls common-service inside the cluster',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TelemetryProvider>{children}</TelemetryProvider>
        <Toaster />
      </body>
    </html>
  );
}
