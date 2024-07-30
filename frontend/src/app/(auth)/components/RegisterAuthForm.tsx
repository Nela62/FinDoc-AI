'use client';

import { z } from 'zod';
import { BaseAuthForm, AuthFormType } from './BaseAuthForm';

const registerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(),
  password: z.string().optional(),
  token: z.string().optional(),
});

export const RegisterAuthForm = ({
  signInWithOtp,
  verifyOtp,
}: {
  signInWithOtp: (values: AuthFormType) => Promise<{ error: string | null }>;
  verifyOtp: (values: AuthFormType) => Promise<{ error: string | null }>;
}) => {
  const onSubmit = async (values: AuthFormType) => {
    if (values.token) {
      await verifyOtp(values);
    } else {
      await signInWithOtp(values);
    }
  };

  return (
    <BaseAuthForm
      mode="register"
      onSubmit={onSubmit}
      formSchema={registerFormSchema}
    />
  );
};
