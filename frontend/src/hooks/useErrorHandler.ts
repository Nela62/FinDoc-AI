import { useState, useCallback } from 'react';
import { useLogger } from 'next-axiom';
import { AuthApiError } from '@supabase/supabase-js';
import { AuthenticationError } from '@/types/error';

// export type BaseError = {
//   message: string;
//   functionName: string;
//   functionInputs: Record<string, any>;
//   stack: string;
// };

// export type AuthenticationError = BaseError & { status: number; code: string };

export type ErrorState = {
  hasError: boolean;
  message: string;
};

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    message: '',
  });
  const log = useLogger();

  const handleError = useCallback(
    (error: any, shouldLog: boolean = true) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }

      console.log(error.constructor.name);
      console.log(error instanceof AuthenticationError);

      if (error instanceof AuthenticationError) {
        setError({ hasError: true, message: error.message });

        shouldLog && log.error('Error occurred', error);
      }
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
        shouldLog &&
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
