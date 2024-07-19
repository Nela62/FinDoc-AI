import { cn } from '@/lib/utils';
import { icons } from 'lucide-react';
import { memo } from 'react';

export type IconProps = {
  name: string;
  className?: string;
  strokeWidth?: number;
};

export const Icon = memo(({ name, className, strokeWidth }: IconProps) => {
  const IconComponent = icons[name as keyof typeof icons];

  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      className={cn('w-4 h-4', className)}
      strokeWidth={strokeWidth || 2.5}
    />
  );
});

Icon.displayName = 'Icon';
