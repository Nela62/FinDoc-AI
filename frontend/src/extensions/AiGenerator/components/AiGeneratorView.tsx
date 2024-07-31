import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NodeViewWrapper, NodeViewWrapperProps } from '@tiptap/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2Icon } from 'lucide-react';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import toast from 'react-hot-toast';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';

import { Icon } from '@/components/ui/Icon';
import { markdownToHtml } from '@/lib/utils/formatText';
import { createClient } from '@/lib/supabase/client';
import { getReportIdByUrl } from '@/lib/queries';
import { usePathname } from 'next/navigation';
// import {
//   getCitationMapAndInsertNew,
//   getCleanText,
// } from '@/lib/utils/citations';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

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
  const label = node.attrs.label;

  const [previewText, setPreviewText] = useState<string>('');
  const [originalText, setOriginalText] = useState<string>('');
  const [isFetching, setIsFetching] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const [user, setUser] = useState<string | null>(null);

  const supabase = createClient();
  const pathname = usePathname();
  const reportUrl = pathname.split('/').pop() as string;

  const investmentThesisFormSchema = z.object({
    recommendation: z.string(),
    targetPrice: z.preprocess(
      (a) => parseFloat(z.string().parse(a)),
      z.number().optional(),
    ),
    customPrompt: z.string().optional(),
  });

  const valuationFormSchema = z.object({
    rating: z.string().optional(),
    customPrompt: z.string().optional(),
  });

  const blocksFormSchema = z.object({
    customPrompt: z.string().optional(),
  });

  const investmentThesisForm = useForm<
    z.infer<typeof investmentThesisFormSchema>
  >({
    resolver: zodResolver(investmentThesisFormSchema),
    defaultValues: {
      recommendation: 'AUTO',
    },
  });

  const valuationForm = useForm<z.infer<typeof valuationFormSchema>>({
    resolver: zodResolver(valuationFormSchema),
    defaultValues: { rating: 'AUTO' },
  });

  const blocksForm = useForm<z.infer<typeof blocksFormSchema>>({
    resolver: zodResolver(blocksFormSchema),
  });

  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      if (res.data.user) setUser(res.data.user.id);
    });
  }, [supabase.auth]);

  const { data: report } = useQuery(getReportIdByUrl(supabase, reportUrl));

  // const { mutateAsync: insertDocuments } = useInsertMutation(
  //   supabase.from('documents_reports'),
  //   ['id'],
  //   null,
  // );

  // const { mutateAsync: insertCitedDocuments } = useInsertMutation(
  //   supabase.from('cited_documents'),
  //   ['id'],
  //   'id',
  // );

  // const { mutateAsync: insertCitationSnippets } = useInsertMutation(
  //   supabase.from('citation_snippets'),
  //   ['id'],
  //   'id',
  // );

  // const { mutateAsync: insertPDFCitations } = useInsertMutation(
  //   supabase.from('pdf_citations'),
  //   ['id'],
  //   'id',
  // );

  // const { mutateAsync: insertAPICitations } = useInsertMutation(
  //   supabase.from('api_citations'),
  //   ['id'],
  //   'id',
  // );

  const textareaId = useMemo(() => uuid(), []);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const tempCitations = useRef<any[]>([]);

  async function streamContent(content: string, delay: number) {
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
    setPreviewText('');
    setIsFetching(true);
    if (!report) return;

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (!session) return;
      // TODO: fix citations and how text is parsed
      const body: any = {
        prompt_type: promptType,
        report_id: report.id,
        ticker: 'AMZN',
      };
      if (customPrompt) body['custom_prompt'] = customPrompt;

      const response = await fetch(`${baseUrl}/aigenerator/`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'content-type': 'application/json',
          Authorization: session.access_token,
        },
      });

      const json = await response.json();
      const text = json.text;
      tempCitations.current = json.citations;

      if (!text.length) {
        setIsFetching(false);

        return;
      }

      setCustomPrompt('');
      setOriginalText(text);
      setIsFetching(false);
      setIsStreaming(true);
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
  }, [baseUrl, promptType, customPrompt, report, supabase.auth]);

  const onInvestmentThesisSubmit = (
    values: z.infer<typeof investmentThesisFormSchema>,
  ) => {
    let customPrompt = '';

    if (values.recommendation !== 'AUTO') {
      customPrompt =
        'The recommendation for this stock must be ' +
        values.recommendation +
        '.';
      if (values.targetPrice) {
        customPrompt +=
          ' The target price for this stock must be $' +
          values.targetPrice +
          '.';
      }
    }

    if (values.customPrompt) {
      customPrompt += ' ' + values.customPrompt;
    }

    setCustomPrompt(customPrompt);
    generateText();
  };

  const onValuationSubmit = (values: z.infer<typeof valuationFormSchema>) => {
    let customPrompt = '';

    if (values.rating !== 'AUTO') {
      customPrompt = 'The rating for this stock must be ' + values.rating + '.';
    }

    if (values.customPrompt) {
      customPrompt += ' ' + values.customPrompt;
    }

    setCustomPrompt(customPrompt);
    generateText();
  };

  const onBlockFormSubmit = (values: z.infer<typeof blocksFormSchema>) => {
    if (values.customPrompt) {
      setCustomPrompt(values.customPrompt);
    }
    generateText();
  };

  // Note: Adding generateText as a dependency causes an infinite loop when inserting text due to custom prompt
  useEffect(() => {
    if (promptType === 'investment_thesis' || promptType === 'valuation')
      return;
    else generateText();
  }, [promptType, generateText]);

  const formattedPreviewText = useMemo(
    () => markdownToHtml(previewText),
    [previewText],
  );

  const from = getPos();
  const to = from + node.nodeSize;

  const insertContent = useCallback(async () => {
    if (!user || !report) return;
    // const oldToNewCitationsMap = await getCitationMapAndInsertNew(
    //   originalText,
    //   tempCitations.current,
    //   report.id,
    //   user,
    //   insertCitedDocuments,
    //   insertCitationSnippets,
    //   insertPDFCitations,
    //   insertAPICitations,
    // );

    // const cleanText = getCleanText(originalText, oldToNewCitationsMap);
    // editor
    //   .chain()
    //   .focus()
    //   .insertContentAt({ from, to }, markdownToJson(cleanText))
    //   .run();
    // setPreviewText('');
  }, [
    // editor,
    // from,
    // to,
    user,
    report,
    // insertAPICitations,
    // insertCitationSnippets,
    // insertCitedDocuments,
    // originalText,
    // insertPDFCitations,
  ]);

  const discard = useCallback(() => {
    deleteNode();
  }, [deleteNode]);

  const formButtons = (
    <div className="flex justify-end w-full pt-2 gap-2">
      <Button
        variant="ghost"
        className="text-red-500 hover:bg-red-500/10 hover:text-red-500 flex gap-1"
        onClick={discard}
      >
        <Icon name="Trash" />
        Discard
      </Button>
      {previewText && (
        <Button variant="ghost" onClick={insertContent}>
          <Icon name="Check" />
          Insert
        </Button>
      )}
      <Button type="submit" className="" onClick={generateText}>
        {previewText ? <Icon name="Repeat" /> : <Icon name="Sparkles" />}
        {previewText ? 'Regenerate' : 'Generate text'}
      </Button>
    </div>
  );

  const investmentThesisComponent = (
    <Form {...investmentThesisForm}>
      <form
        onSubmit={investmentThesisForm.handleSubmit(onInvestmentThesisSubmit)}
        className="space-y-2"
      >
        <div className="w-full flex gap-4">
          <FormField
            control={investmentThesisForm.control}
            name="recommendation"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <FormLabel>Recommendation</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AUTO">Auto</SelectItem>
                    <SelectItem value="BUY">Buy</SelectItem>
                    <SelectItem value="OVERWEIGHT">Overweight</SelectItem>
                    <SelectItem value="HOLD">Hold</SelectItem>
                    <SelectItem value="UNDERWEIGHT">Underweight</SelectItem>
                    <SelectItem value="SELL">Sell</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={investmentThesisForm.control}
            name="targetPrice"
            disabled={investmentThesisForm.watch('recommendation') === 'AUTO'}
            render={({ field }) => (
              <FormItem className="w-1/2 relative">
                <FormLabel>Target Price</FormLabel>
                <div className="absolute l-0 ml-2 b-0 text-foreground/70">
                  <p className="pt-1.5 text-sm">$</p>
                </div>
                <FormControl>
                  <Input {...field} className="pl-6" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {previewText && (
          <FormField
            control={investmentThesisForm.control}
            name="customPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Instructions</FormLabel>
                <FormControl>
                  <Textarea {...field}></Textarea>
                </FormControl>
              </FormItem>
            )}
          />
        )}
        {formButtons}
      </form>
    </Form>
  );

  const valuationComponent = (
    <Form {...valuationForm}>
      <form
        onSubmit={valuationForm.handleSubmit(onValuationSubmit)}
        className="space-y-2"
      >
        <div className="w-full flex gap-4">
          <FormField
            control={valuationForm.control}
            name="rating"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <FormLabel>Analyst Rating</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AUTO">AUTO</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {previewText && (
          <FormField
            control={investmentThesisForm.control}
            name="customPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Instructions</FormLabel>
                <FormControl>
                  <Textarea {...field}></Textarea>
                </FormControl>
              </FormItem>
            )}
          />
        )}
        {formButtons}
      </form>
    </Form>
  );

  const allBlocksComponent = (
    <Form {...blocksForm}>
      <form
        onSubmit={blocksForm.handleSubmit(onBlockFormSubmit)}
        className="space-y-2"
      >
        {previewText && (
          <FormField
            control={blocksForm.control}
            name="customPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Instructions</FormLabel>
                <FormControl>
                  <Textarea {...field}></Textarea>
                </FormControl>
              </FormItem>
            )}
          />
        )}
        {formButtons}
      </form>
    </Form>
  );

  return (
    <NodeViewWrapper data-drag-handle>
      <Card className="">
        <CardHeader className="font-semibold">{label}</CardHeader>
        <CardContent>
          {/* Fetching view */}
          {isFetching && (
            <div className="flex justify-center flex-col w-full py-2 items-center">
              <Loader2Icon className="mr-2 h-6 w-6 animate-spin" />
              <p>Generating text...</p>
            </div>
          )}
          {/* Display preview text */}
          {previewText && (
            <div
              className="bg-accent px-2 py-2 rounded-[5px] mb-3"
              dangerouslySetInnerHTML={{ __html: formattedPreviewText }}
            ></div>
          )}
          {promptType === 'investment_thesis' &&
            !isFetching &&
            !isStreaming &&
            investmentThesisComponent}
          {promptType === 'valuation' &&
            !isFetching &&
            !isStreaming &&
            valuationComponent}
          {promptType !== 'investment_thesis' &&
            promptType !== 'valuation' &&
            allBlocksComponent}
        </CardContent>
      </Card>
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
