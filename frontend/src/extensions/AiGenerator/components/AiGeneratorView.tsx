import {
  Extension,
  NodeViewWrapper,
  NodeViewWrapperProps,
} from '@tiptap/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';

import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { Panel, PanelHeadline } from '@/components/ui/Panel';
import { Textarea } from '@/components/ui/Textarea';
import { Icon } from '@/components/ui/Icon';

import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Toolbar } from '@/components/ui/Toolbar';
import { Surface } from '@/components/ui/Surface';
import { DropdownButton } from '@/components/ui/Dropdown';
import { useCitationsStateStore } from '@/store';

export interface DataProps {
  text: string;
  addHeading: boolean;
  textUnit?: string;
  textLength?: string;
  language?: string;
}

export const AiGeneratorView = ({
  editor,
  node,
  getPos,
  deleteNode,
}: NodeViewWrapperProps) => {
  const promptType = node.attrs.promptType;
  // const text =
  //   "Based on the provided context, Apple has a minority market share in the global smartphone, personal computer and tablet markets compared to its competitors. This smaller market share can make third-party software developers less inclined to prioritize developing applications for Apple's platforms.\nThe context does not provide specific details on Apple's market share or position in the wearables industry compared to rivals. It also does not comment on the strength of Apple's management team or their ability to execute on future growth initiatives.\nThe information focuses more on the challenges Apple faces due to its smaller market share in certain product categories, and the potential impacts on the availability of third-party software for its devices. Additional context would be needed to comprehensively address Apple's competitive position across its major product lines and the capabilities of its management.";

  const [previewText, setPreviewText] = useState<string>('');
  const [isFetching, setIsFetching] = useState(false);
  const textareaId = useMemo(() => uuid(), []);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const citations = useCitationsStateStore((state) => state.citations);
  const addCitations = useCitationsStateStore((state) => state.addCitations);

  const generateText = useCallback(async () => {
    setIsFetching(true);

    try {
      const response = await fetch(
        `${baseUrl}/aigenerator?promptType=${promptType}`,
        {
          method: 'GET',
        },
      );
      console.log(response);

      const json = await response.json();
      const text = json.response;
      addCitations(json.nodes);

      if (!text.length) {
        setIsFetching(false);

        return;
      }

      setPreviewText(text);

      setIsFetching(false);
    } catch (errPayload: any) {
      const errorMessage = errPayload?.response?.data?.error;
      const message =
        errorMessage !== 'An error occurred'
          ? `An error has occured: ${errorMessage}`
          : errorMessage;

      setIsFetching(false);
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    generateText();
  }, []);

  const formattedPreviewText = useMemo(
    () =>
      previewText
        .split('\n')
        .map((p) => `<p>${p}</p>`)
        .join(''),
    [previewText],
  );

  const from = getPos();
  const to = from + node.nodeSize;

  const insert = useCallback(() => {
    console.log(formattedPreviewText);
    editor
      .chain()
      .focus()
      .insertContentAt({ from, to }, formattedPreviewText)
      .run();
    setPreviewText('');
  }, [formattedPreviewText, editor, from, to]);

  const discard = useCallback(() => {
    deleteNode();
  }, [deleteNode]);

  return (
    <NodeViewWrapper data-drag-handle>
      {previewText && (
        <div
          className="bg-blue-200 px-2 py-2 rounded-[5px]"
          dangerouslySetInnerHTML={{ __html: formattedPreviewText }}
        ></div>
      )}
      <div className="flex justify-end w-auto gap-3 mt-4">
        {previewText && (
          <Button
            variant="ghost"
            className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
            onClick={discard}
          >
            <Icon name="Trash" />
            Discard
          </Button>
        )}
        {previewText && (
          <Button variant="ghost" onClick={insert} disabled={!previewText}>
            <Icon name="Check" />
            Insert
          </Button>
        )}
        <Button
          variant="primary"
          // onClick={generateText}
          style={{ whiteSpace: 'nowrap' }}
        >
          {previewText ? <Icon name="Repeat" /> : <Icon name="Sparkles" />}
          {previewText ? 'Regenerate' : 'Generate text'}
        </Button>
      </div>
    </NodeViewWrapper>
  );
};
//   (ext: Extension) => ext.name === 'ai',
// ).options;
// const [data, setData] = useState<DataProps>({
//   text: '',
//   textLength: undefined,
//   addHeading: false,
//   language: undefined,
// });
// const [previewText, setPreviewText] = useState(undefined);
// const [isFetching, setIsFetching] = useState(false);
// const textareaId = useMemo(() => uuid(), []);
// const generateText = useCallback(async () => {
//   const { text: dataText, textLength, textUnit, addHeading, language } = data;
//   if (!data.text) {
//     toast.error('Please enter a description');
//     return;
//   }
//   setIsFetching(true);
//   const payload = {
//     text: dataText,
//     textLength: textLength,
//     textUnit: textUnit,
//     useHeading: addHeading,
//     language,
//   };
//   try {
//     const { baseUrl, appId, token } = aiOptions;
//     const response = await fetch(`${baseUrl}/text/prompt`, {
//       method: 'POST',
//       headers: {
//         accept: 'application.json',
//         'Content-Type': 'application/json',
//         'X-App-Id': appId.trim(),
//         Authorization: `Bearer ${token.trim()}`,
//       },
//       body: JSON.stringify(payload),
//     });
//     const json = await response.json();
//     const text = json.response;
//     if (!text.length) {
//       setIsFetching(false);
//       return;
//     }
//     setPreviewText(text);
//     setIsFetching(false);
//   } catch (errPayload: any) {
//     const errorMessage = errPayload?.response?.data?.error;
//     const message =
//       errorMessage !== 'An error occurred'
//         ? `An error has occured: ${errorMessage}`
//         : errorMessage;
//     setIsFetching(false);
//     toast.error(message);
//   }
// }, [data, aiOptions]);
// const insert = useCallback(() => {
//   const from = getPos();
//   const to = from + node.nodeSize;
//   editor.chain().focus().insertContentAt({ from, to }, previewText).run();
// }, [editor, previewText, getPos, node.nodeSize]);
// const discard = useCallback(() => {
//   deleteNode();
// }, [deleteNode]);
// const onTextAreaChange = useCallback(
//   (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setData((prevData) => ({ ...prevData, text: e.target.value }));
//   },
//   [],
// );
// const onUndoClick = useCallback(() => {
//   setData((prevData) => ({ ...prevData, tone: undefined }));
// }, []);
// const createItemClickHandler = useCallback((tone: AiToneOption) => {
//   return () => {
//     setData((prevData) => ({ ...prevData, tone: tone.value }));
//   };
// }, []);
// return (
//   <NodeViewWrapper data-drag-handle>
//     <Panel noShadow className="w-full">
//       <div className="flex flex-col p-1">
//         {isFetching && <Loader label="AI is now doing its job!" />}
//         {previewText && (
//           <>
//             <PanelHeadline>Preview</PanelHeadline>
//             <div
//               className="bg-white dark:bg-black border-l-4 border-neutral-100 dark:border-neutral-700 text-black dark:text-white text-base max-h-[14rem] mb-4 ml-2.5 overflow-y-auto px-4 relative"
//               dangerouslySetInnerHTML={{ __html: previewText }}
//             />
//           </>
//         )}
//         <div className="flex flex-row items-center justify-between gap-1">
//           <PanelHeadline asChild>
//             <label htmlFor={textareaId}>Prompt</label>
//           </PanelHeadline>
//         </div>
//         <Textarea
//           id={textareaId}
//           value={data.text}
//           onChange={onTextAreaChange}
//           placeholder={'Tell me what you want me to write about.'}
//           required
//           className="mb-2"
//         />
//         <div className="flex flex-row items-center justify-between gap-1">
//           <div className="flex justify-between w-auto gap-1">
//             <Dropdown.Root>
//               <Dropdown.Trigger asChild>
//                 <Button variant="tertiary">
//                   <Icon name="Mic" />
//                   {currentTone?.label || 'Change tone'}
//                   <Icon name="ChevronDown" />
//                 </Button>
//               </Dropdown.Trigger>
//               <Dropdown.Portal>
//                 <Dropdown.Content side="bottom" align="start" asChild>
//                   <Surface className="p-2 min-w-[12rem]">
//                     {!!data.tone && (
//                       <>
//                         <Dropdown.Item asChild>
//                           <DropdownButton
//                             isActive={data.tone === undefined}
//                             onClick={onUndoClick}
//                           >
//                             <Icon name="Undo2" />
//                             Reset
//                           </DropdownButton>
//                         </Dropdown.Item>
//                         <Toolbar.Divider horizontal />
//                       </>
//                     )}
//                     {tones.map((tone) => (
//                       <Dropdown.Item asChild key={tone.value}>
//                         <DropdownButton
//                           isActive={tone.value === data.tone}
//                           onClick={createItemClickHandler(tone)}
//                         >
//                           {tone.label}
//                         </DropdownButton>
//                       </Dropdown.Item>
//                     ))}
//                   </Surface>
//                 </Dropdown.Content>
//               </Dropdown.Portal>
//             </Dropdown.Root>
//           </div>
//           <div className="flex justify-between w-auto gap-1">
//             {previewText && (
//               <Button
//                 variant="ghost"
//                 className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
//                 onClick={discard}
//               >
//                 <Icon name="Trash" />
//                 Discard
//               </Button>
//             )}
//             {previewText && (
//               <Button
//                 variant="ghost"
//                 onClick={insert}
//                 disabled={!previewText}
//               >
//                 <Icon name="Check" />
//                 Insert
//               </Button>
//             )}
//             <Button
//               variant="primary"
//               onClick={generateText}
//               style={{ whiteSpace: 'nowrap' }}
//             >
//               {previewText ? (
//                 <Icon name="Repeat" />
//               ) : (
//                 <Icon name="Sparkles" />
//               )}
//               {previewText ? 'Regenerate' : 'Generate text'}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </Panel>
//   </NodeViewWrapper>
// );
