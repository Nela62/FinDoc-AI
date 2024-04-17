'use client';

import { Button } from '@/components/ui/button';
import { IconBrandGoogle } from '@tabler/icons-react';
import { Loader, LucideProps } from 'lucide-react';
import { useFormStatus } from 'react-dom';

const icons = {
  Google: (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" {...props}>
      <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
    </svg>
  ),
  Microsoft: (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
      <path d="M0 32h214.6v214.6H0V32zm233.4 0H448v214.6H233.4V32zM0 265.4h214.6V480H0V265.4zm233.4 0H448V480H233.4V265.4z" />
    </svg>
  ),
};

export function BrandSubmitButton({
  formAction,
  brand,
}: {
  formAction: any;
  brand: 'Google' | 'Microsoft';
}) {
  const { pending, action } = useFormStatus();

  const isPending = pending && action === formAction;

  return (
    <Button variant="outline" type="button" disabled={isPending}>
      {isPending ? (
        <Loader className="mr-2 h-4 w-4 animate-spin" />
      ) : brand === 'Google' ? (
        <icons.Google className="mr-2 h-4 w-4" />
      ) : (
        <icons.Microsoft className="mr-2 h-4 w-4" />
      )}
      {brand === 'Google' ? 'Google' : 'Microsoft'}
    </Button>
    // <button {...props} type="submit" aria-disabled={pending}>
    //   {isPending ? pendingText : children}
    // </button>
  );
}
