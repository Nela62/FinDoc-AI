import { BaseAuthForm } from '../components/BaseAuthForm';
import {
  registerWithOtp,
  signInWithOtp,
  signInWithPassword,
  verifyOtp,
} from '@/lib/authService/authService';

export default function Register() {
  return (
    <BaseAuthForm
      mode="register"
      signInWithPassword={signInWithPassword}
      signInWithOtp={signInWithOtp}
      registerWithOtp={registerWithOtp}
      verifyOtp={verifyOtp}
    />
  );
}
