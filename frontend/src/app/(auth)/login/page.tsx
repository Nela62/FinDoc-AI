import {
  registerWithOtp,
  signInWithOtp,
  signInWithPassword,
  verifyOtp,
} from '@/lib/authService/authService';
import { BaseAuthForm } from '../components/BaseAuthForm';
import { Suspense } from 'react';

export default async function Login() {
  return (
    <Suspense>
      <BaseAuthForm
        mode="login"
        signInWithPassword={signInWithPassword}
        signInWithOtp={signInWithOtp}
        registerWithOtp={registerWithOtp}
        verifyOtp={verifyOtp}
      />
    </Suspense>
  );
}
