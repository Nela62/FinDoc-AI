import Image from 'next/image';

import { useFileUrl } from '@supabase-cache-helpers/storage-react-query';
import { createClient } from '@/lib/supabase/client';

export const DisplayLogo = ({
  userId,
  fileName,
}: {
  userId: string;
  fileName: string;
}) => {
  const supabase = createClient();

  const { data: url } = useFileUrl(
    supabase.storage.from('company-logos'),
    `${userId}/${fileName}`,
    'private',
    {
      ensureExistence: true,
      refetchOnWindowFocus: false,
      enabled: !!fileName,
    },
  );

  if (!url) {
    return;
    // throw new Error('Url not found.');
  }

  return (
    <div className="">
      <Image
        src={url}
        alt="preview image"
        className="h-8 w-auto bg-zinc-500 rounded-sm p-2 py-1"
        height={0}
        width={0}
        sizes="100vw"
      />
    </div>
  );
};
