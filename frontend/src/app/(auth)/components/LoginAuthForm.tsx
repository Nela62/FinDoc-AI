'use client';

import { z } from 'zod';
import { BaseAuthForm, AuthFormType } from './BaseAuthForm';

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
  token: z.string().optional(),
});

export const LoginAuthForm = ({
  signInWithPassword,
  signInWithOtp,
  verifyOtp,
}: {
  signInWithPassword: (
    values: AuthFormType,
  ) => Promise<{ error: string | null }>;
  signInWithOtp: (values: AuthFormType) => Promise<{ error: string | null }>;
  verifyOtp: (values: AuthFormType) => Promise<{ error: string | null }>;
}) => {
  const onSubmit = async (values: AuthFormType) => {
    if (values.token) {
      await verifyOtp(values);
    } else if (values.password) {
      await signInWithPassword(values);
    } else {
      await signInWithOtp(values);
    }
  };

  return (
    <BaseAuthForm
      mode="login"
      onSubmit={onSubmit}
      formSchema={loginFormSchema}
    />
  );
};
