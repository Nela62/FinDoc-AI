'use client';

import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

type Props = {
  children: ReactNode;
};

export default function ProgressBarProvider({ children }: Props) {
  return (
    <>
      {children}
      <Suspense>
        <ProgressBar
          height="4px"
          color="#4f46e5"
          options={{ showSpinner: false, speed: 500 }}
          delay={500}
        />
      </Suspense>
    </>
  );
}
