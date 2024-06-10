import Image from 'next/image';

import {
  useDirectory,
  useFileUrl,
} from '@supabase-cache-helpers/storage-react-query';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export const DisplayIcon = ({
  cik,
  companyName,
}: {
  cik: string;
  companyName: string;
}) => {
  const [iconName, setIconName] = useState<string | null>(null);

  const supabase = createClient();

  const { data: images } = useDirectory(
    supabase.storage.from('public-company-logos'),
    cik,
    { refetchOnWindowFocus: false },
  );

  const { data: url } = useFileUrl(
    supabase.storage.from('public-company-logos'),
    `${cik}/${iconName}`,
    'private',
    {
      ensureExistence: true,
      refetchOnWindowFocus: false,
      enabled: !!iconName,
    },
  );

  useEffect(() => {
    if (!images) return;
    const icon =
      images.find((image) => image.name === 'dark-icon') ??
      images.find((image) => image.name === 'light-icon') ??
      images.find((image) => image.name === 'dark-logo') ??
      images.find((image) => image.name === 'light-logo') ??
      images.find((image) => image.name === 'dark-symbol') ??
      images.find((image) => image.name === 'light-symbol');

    setIconName(icon?.name ?? null);
  }, [images]);

  return (
    <div className="">
      {iconName && url ? (
        <Image
          src={url}
          alt="preview image"
          className={cn(
            'h-10 w-10',
            iconName.includes('light') && 'bg-background/60',
          )}
          height={0}
          width={0}
          sizes="100vw"
        />
      ) : (
        <div className="h-5 w-5 bg-background/60 text-white text-lg">
          {companyName[0]}
        </div>
      )}
    </div>
  );
};
