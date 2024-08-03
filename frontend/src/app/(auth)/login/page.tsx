import {
  registerWithOtp,
  signInWithOtp,
  signInWithPassword,
  verifyOtp,
} from '@/lib/authService/authService';
import { BaseAuthForm } from '../components/BaseAuthForm';

export default async function Login() {
  return (
    <BaseAuthForm
      mode="login"
      signInWithPassword={signInWithPassword}
      signInWithOtp={signInWithOtp}
      registerWithOtp={registerWithOtp}
      verifyOtp={verifyOtp}
    />
  );
}
