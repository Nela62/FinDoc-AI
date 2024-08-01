import { AuthenticationError, BaseError } from '@/types/error';
import { isAuthApiError } from '@supabase/supabase-js';

export const handleUnexpectedError = (
  error: any,
  fnName: string,
  fnInputs: Record<string, any>,
) => {
  if (isAuthApiError(error)) {
    throw new AuthenticationError(
      error.message,
      fnName,
      fnInputs,
      [],
      error.status,
      error.code,
    );
  } else if (error.constructor.name === Error) {
    throw new BaseError(error.message, fnName, fnInputs, []);
  } else {
    throw error;
  }
};

export const handleUnexpectedServerError = (
  error: any,
  fnName: string,
  fnInputs: Record<string, any>,
) => {
  if (isAuthApiError(error)) {
    return {
      error: new AuthenticationError(
        error.message,
        fnName,
        fnInputs,
        [],
        error.status,
        error.code,
      ),
    };
  } else if (error.constructor.name === Error) {
    return { error: new BaseError(error.message, fnName, fnInputs, []) };
  } else {
    return { error };
  }
};
