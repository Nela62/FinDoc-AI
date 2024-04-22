import { AxiomWebVitals } from 'next-axiom';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import 'cal-sans';
import { StoreProvider } from '@/providers/store-provider';
import { ReactQueryClientProvider } from '@/components/ReactQueryClientProvider';

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
    <ReactQueryClientProvider>
      <html lang="en" className="h-full font-sans">
        <body className={`${inter.className} h-full flex flex-col bg-zinc-50`}>
          <main className="h-full">
            <StoreProvider>{children}</StoreProvider>
          </main>
        </body>
        <AxiomWebVitals />
      </html>
    </ReactQueryClientProvider>
  );
}
