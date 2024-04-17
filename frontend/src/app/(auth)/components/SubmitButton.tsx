'use client';

import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { type ComponentProps } from 'react';

type Props = ComponentProps<'button'> & {
  label?: string;
};

export function SubmitButton({ label, ...props }: Props) {
  const { pending, action } = useFormStatus();

  const isPending = pending && action === props.formAction;

  return (
    <Button type="submit" {...props} aria-disabled={pending}>
      {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
      {label}
    </Button>
    // <button {...props} type="submit" aria-disabled={pending}>
    //   {isPending ? pendingText : children}
    // </button>
  );
}
