import { cn } from '@/lib/utils';
import { createServiceClient } from '@/lib/utils/supabase/client';
import { Node } from '@tiptap/pm/model';
import { Editor, NodeViewWrapper } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ImageBlockViewProps {
  editor: Editor;
  getPos: () => number;
  node: Node & {
    attrs: {
      src: string;
    };
  };
  updateAttributes: (attrs: Record<string, string>) => void;
}

export const ImageBlockView = (props: ImageBlockViewProps) => {
  const supabase = createServiceClient();
  const [url, setUrl] = useState<string>('');

  const { editor, getPos, node } = props;
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const { src } = node.attrs;

  const wrapperClassName = cn(
    node.attrs.align === 'left' ? 'ml-0' : 'ml-auto',
    node.attrs.align === 'right' ? 'mr-0' : 'mr-auto',
    node.attrs.align === 'center' && 'mx-auto',
  );

  const onClick = useCallback(() => {
    editor.commands.setNodeSelection(getPos());
  }, [getPos, editor.commands]);

  const getSrc = useCallback(async () => {
    const { data, error } = await supabase.storage
      .from('images')
      .createSignedUrl(src, 3600);

    if (data) return data.signedUrl;
  }, [src, supabase.storage]);

  useEffect(() => {
    getSrc().then((signedUrl) => {
      if (!signedUrl) return;
      setUrl(signedUrl);
    });
  }, [getSrc]);

  return (
    <NodeViewWrapper>
      <div className={wrapperClassName} style={{ width: node.attrs.width }}>
        <div contentEditable={false} ref={imageWrapperRef}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="block" src={url} alt="" onClick={onClick} />
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default ImageBlockView;
