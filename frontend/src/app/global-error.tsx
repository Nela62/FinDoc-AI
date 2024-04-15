'use client';

import * as Sentry from '@sentry/nextjs';
import Error from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  statusCode,
}: {
  error: Error;
  statusCode: number;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <Error statusCode={statusCode ?? 400} />
      </body>
    </html>
  );
}
