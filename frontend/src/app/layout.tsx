import { AxiomWebVitals } from 'next-axiom';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import 'cal-sans';
import { StoreProvider } from '@/providers/store-provider';
import { ReactQueryClientProvider } from '@/providers/ReactQueryClientProvider';
// import { CSPostHogProvider } from '@/providers/PostHogClientProvider';
import { Toaster } from '@/components/ui/toaster';
import { PdfWorkerProvider } from '@/providers/PdfWorkerProvider';
import PageAnalytics from '@/components/analytics/pageAnalytics';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Findoc - Financial Report Generation',
  description: 'Supercharge your financial report generation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <CSPostHogProvider>
    // <Suspense>
    <ReactQueryClientProvider>
      <html lang="en" className="h-full font-sans">
        <body
          className={`${inter.className} h-full flex flex-col bg-background`}
        >
          <main className="h-full">
            <StoreProvider>
              <PdfWorkerProvider>{children}</PdfWorkerProvider>
            </StoreProvider>
          </main>
          <Toaster />
        </body>
        <PageAnalytics />
        {/* <AxiomWebVitals /> */}
      </html>
    </ReactQueryClientProvider>
    // </Suspense>
    // </CSPostHogProvider>
  );
}
