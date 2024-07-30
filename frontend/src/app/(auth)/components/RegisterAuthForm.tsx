import { BaseAuthForm } from './BaseAuthForm';
import {
  registerWithOtp,
  signInWithOtp,
  signInWithPassword,
  verifyOtp,
} from '@/lib/authService';

export const RegisterAuthForm = () => {
  return (
    <BaseAuthForm
      mode="register"
      signInWithPassword={signInWithPassword}
      signInWithOtp={signInWithOtp}
      registerWithOtp={registerWithOtp}
      verifyOtp={verifyOtp}
    />
  );
};
