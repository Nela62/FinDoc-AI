import { AxiomWebVitals } from 'next-axiom';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import 'cal-sans';
import { StoreProvider } from '@/providers/store-provider';
import { ReactQueryClientProvider } from '@/providers/ReactQueryClientProvider';
import { CSPostHogProvider } from '@/providers/PostHogClientProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Coreline - Financial Report Generation',
  description: 'Supercharge your financial report generation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CSPostHogProvider>
      <ReactQueryClientProvider>
        <html lang="en" className="h-full font-sans">
          <body
            className={`${inter.className} h-full flex flex-col bg-background`}
          >
            <main className="h-full">
              <StoreProvider>{children}</StoreProvider>
            </main>
          </body>
          <AxiomWebVitals />
        </html>
      </ReactQueryClientProvider>
    </CSPostHogProvider>
  );
}
