import * as React from 'react';

import { registerWithOtp, verifyOtp } from '@/lib/authService';
import { RegisterAuthForm } from '../components/RegisterAuthForm';

export default async function Register() {
  return (
    <RegisterAuthForm signInWithOtp={registerWithOtp} verifyOtp={verifyOtp} />
  );
}
