import { BaseAuthForm } from './BaseAuthForm';
import {
  registerWithOtp,
  signInWithOtp,
  signInWithPassword,
  verifyOtp,
} from '@/lib/authService';

export const LoginAuthForm = () => {
  return (
    <BaseAuthForm
      mode="login"
      signInWithPassword={signInWithPassword}
      signInWithOtp={signInWithOtp}
      registerWithOtp={registerWithOtp}
      verifyOtp={verifyOtp}
    />
  );
};
