import { useState, useCallback } from 'react';
import { useLogger } from 'next-axiom';
import { AuthApiError } from '@supabase/supabase-js';

interface ErrorState {
  hasError: boolean;
  message: string;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    message: '',
  });
  const log = useLogger();

  const handleError = useCallback(
    (error: Error | any) => {
      if (error instanceof Error) {
        const errorMessage = error.message || 'An unexpected error occurred';
        setError({
          hasError: true,
          message: errorMessage,
        });

        if (process.env.NODE_ENV === 'development') {
          console.error(error);
        }

        // Log the error with additional context
        log.error('An error occurred', {
          name: error.name,
          error: errorMessage,
          stack: error.stack,
          // Add any other relevant context here
        });
      }
    },
    [log],
  );

  const clearError = useCallback(() => {
    setError({ hasError: false, message: '' });
  }, []);

  return { error, handleError, clearError };
};
