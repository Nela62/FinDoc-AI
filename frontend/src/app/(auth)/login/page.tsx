import * as React from 'react';

import {
  signInWithOtp,
  signInWithPassword,
  verifyOtp,
} from '@/lib/authService';
import { LoginAuthForm } from '../components/LoginAuthForm';

export default function Login() {
  return (
    <LoginAuthForm
      signInWithPassword={signInWithPassword}
      signInWithOtp={signInWithOtp}
      verifyOtp={verifyOtp}
    />
  );
}
