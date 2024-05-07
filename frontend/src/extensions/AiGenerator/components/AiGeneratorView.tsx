import { NodeViewWrapper, NodeViewWrapperProps } from '@tiptap/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';
import { Icon } from '@/components/ui/Icon';
import { markdownToHtml, markdownToJson } from '@/lib/utils/formatText';
import { createClient } from '@/lib/supabase/client';
import { TipTapButton } from '@/components/ui/TipTapButton/TipTapButton';
import {
  useInsertMutation,
  useQuery,
} from '@supabase-cache-helpers/postgrest-react-query';
import { fetchDocuments, getReportIdByUrl } from '@/lib/queries';
import { usePathname } from 'next/navigation';
import {
  getCitationMapAndInsertNew,
  getCleanText,
} from '@/lib/utils/citations';
import { Loader2Icon } from 'lucide-react';

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
  const promptType: string = node.attrs.promptType;
  const [previewText, setPreviewText] = useState<string>('');
  const [originalText, setOriginalText] = useState<string>('');
  const [isFetching, setIsFetching] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  const supabase = createClient();
  const pathname = usePathname();
  const reportUrl = pathname.split('/').pop() as string;

  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      if (res.data.user) setUser(res.data.user.id);
    });
  }, [supabase.auth]);

  const { data: report } = useQuery(getReportIdByUrl(supabase, reportUrl));

  // const { mutateAsync: insertCitations } = useInsertMutation(
  //   supabase.from('citations'),
  //   ['id'],
  //   null,
  // );
  const { mutateAsync: insertDocuments } = useInsertMutation(
    supabase.from('documents_reports'),
    ['id'],
    null,
  );

  const { mutateAsync: insertCitedDocuments } = useInsertMutation(
    supabase.from('cited_documents'),
    ['id'],
    'id',
  );

  const { mutateAsync: insertCitationSnippets } = useInsertMutation(
    supabase.from('citation_snippets'),
    ['id'],
    'id',
  );

  const { mutateAsync: insertPDFCitations } = useInsertMutation(
    supabase.from('pdf_citations'),
    ['id'],
    'id',
  );

  const { mutateAsync: insertAPICitations } = useInsertMutation(
    supabase.from('api_citations'),
    ['id'],
    'id',
  );

  const textareaId = useMemo(() => uuid(), []);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const tempCitations = useRef<any[]>([]);

  async function streamContent(content: string, delay: number) {
    setIsStreaming(true);
    let index = 0;
    const cleanedContent = content.replace(/\s?\[\d+\]/g, '');

    async function type() {
      if (index < cleanedContent.length) {
        setPreviewText(cleanedContent.slice(0, index + 1));
        index++;
        setTimeout(type, delay);
      }
    }

    await type();
    setIsStreaming(false);
  }

  const generateText = useCallback(async () => {
    setIsFetching(true);
    if (!report) return;

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (!session) return;
      // TODO: fix citations and how text is parsed
      const response = await fetch(`${baseUrl}/aigenerator/`, {
        method: 'POST',
        body: JSON.stringify({
          prompt_type: promptType,
          report_id: report.id,
          ticker: 'AMZN',
        }),
        headers: {
          'content-type': 'application/json',
          Authorization: session.access_token,
        },
      });

      const json = await response.json();
      const text = json.text;
      console.log(text);
      tempCitations.current = json.citations;

      if (!text.length) {
        setIsFetching(false);

        return;
      }

      setOriginalText(text);
      setIsFetching(false);
      streamContent(text, 10);
      // setPreviewText(text.replace(/\s?\[\d+\]/g, ''));
    } catch (errPayload: any) {
      const errorMessage = errPayload?.response?.data?.error;
      const message =
        errorMessage !== 'An error occurred'
          ? `An error has occured: ${errorMessage}`
          : errorMessage;

      setIsFetching(false);
      toast.error(message);
    }
  }, [baseUrl, promptType, report, supabase.auth]);

  useEffect(() => {
    generateText();
  }, [generateText]);

  const formattedPreviewText = useMemo(
    () => markdownToHtml(previewText),
    [previewText],
  );

  const from = getPos();
  const to = from + node.nodeSize;

  const insertContent = useCallback(async () => {
    if (!user || !report) return;
    // Add loader when this is being inserted
    // input.map is not an option error
    setIsLoading(true);
    const oldToNewCitationsMap = await getCitationMapAndInsertNew(
      originalText,
      tempCitations.current,
      report.id,
      user,
      insertCitedDocuments,
      insertCitationSnippets,
      insertPDFCitations,
      insertAPICitations,
    );
    console.log('now cleaning text');
    // console.log('final citations map', oldToNewCitationsMap);

    const cleanText = getCleanText(originalText, oldToNewCitationsMap);
    // console.log(cleanText);
    setIsLoading(false);
    editor
      .chain()
      .focus()
      .insertContentAt({ from, to }, markdownToJson(cleanText))
      .run();
    setPreviewText('');
  }, [
    editor,
    from,
    to,
    user,
    report,
    insertAPICitations,
    insertCitationSnippets,
    insertCitedDocuments,
    originalText,
    insertPDFCitations,
  ]);

  const discard = useCallback(() => {
    deleteNode();
  }, [deleteNode]);

  return (
    <NodeViewWrapper data-drag-handle>
      {previewText && (
        <div
          className="bg-indigo-100 px-2 py-2 rounded-[5px]"
          dangerouslySetInnerHTML={{ __html: formattedPreviewText }}
        ></div>
      )}
      {!isFetching && !isStreaming && (
        <div className={` flex justify-end w-auto gap-3 mt-4`}>
          {previewText && (
            <TipTapButton
              variant="ghost"
              className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
              onClick={discard}
            >
              <Icon name="Trash" />
              Discard
            </TipTapButton>
          )}
          {previewText && (
            <TipTapButton
              variant="ghost"
              onClick={insertContent}
              disabled={!previewText || isLoading}
            >
              <Icon name="Check" />
              Insert
            </TipTapButton>
          )}
          <TipTapButton
            variant="primary"
            // onClick={generateText}
            style={{ whiteSpace: 'nowrap' }}
          >
            {previewText ? <Icon name="Repeat" /> : <Icon name="Sparkles" />}
            {previewText ? 'Regenerate' : 'Generate text'}
          </TipTapButton>
        </div>
      )}
      {isFetching && (
        <div className="flex justify-center flex-col w-full mt-4 items-center">
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          <p>Generating text...</p>
        </div>
      )}
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
