import Image from 'next/image';

import {
  useFileUrl,
  useRemoveFiles,
} from '@supabase-cache-helpers/storage-react-query';
import { Trash2 } from 'lucide-react';

import { TypedSupabaseClient } from '@/types/supabase';
import { Button } from '@/components/ui/button';

export const DisplayLogo = ({
  client,
  userId,
  fileName,
}: {
  client: TypedSupabaseClient;
  userId: string;
  fileName: string;
}) => {
  const { data: url } = useFileUrl(
    client.storage.from('company-logos'),
    `${userId}/${fileName}`,
    'private',
    { ensureExistence: true, refetchOnWindowFocus: false },
  );

  const { mutateAsync: remove } = useRemoveFiles(
    client.storage.from('company-logos'),
  );

  if (!url) return <div>Could not load image</div>;

  return (
    <div className="">
      <div className="flex gap-6">
        {/* TODO: add ability to rename */}
        <p>{fileName}</p>
        {/* TODO: add alert dialog on remove */}
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={() => {
            remove([`${userId}/${fileName}`]);
          }}
        >
          <Trash2 />
        </Button>
      </div>
      <Image
        src={url}
        alt="preview image"
        className="h-12 w-auto bg-zinc-500 rounded-sm p-2 py-1"
        height={0}
        width={0}
        sizes="100vw"
      />
    </div>
  );
};
