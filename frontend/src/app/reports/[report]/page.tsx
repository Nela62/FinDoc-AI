'use client';

import { NavBar } from '@/components/NavBar';
import { ContentItemMenu, LinkMenu, TextMenu } from '@/components/menus';
import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu';
import { ColumnsMenu } from '@/extensions/MultiColumn/menus';
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus';
import { useBlockEditor } from '@/hooks/useBlockEditor';
import { Editor, EditorContent } from '@tiptap/react';
import 'ldrs/ring';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import * as ScrollArea from '@radix-ui/react-scroll-area';

import '@/styles/index.css';
import { SquarePen, X, Wand2Icon, ChevronDown } from 'lucide-react';
import { Combobox } from '@/components/ui/Combobox';
import { tickers } from '@/lib/data/tickers';
import { getPrompts } from './prompts';
import { TopBar } from '@/components/TopBar/TopBar';
import { RightSideBar } from '@/components/RightSideBar';
import {
  newAmazonReport,
  newAmazonReportHtml,
  newAmazonReportMarkdown,
} from '@/lib/data/newAmazonReport';
import { Recommendation, ReportType } from '@/stores/reports-store';
import { useBoundStore } from '@/providers/store-provider';
import { createServiceClient } from '@/lib/utils/supabase/client';
export type AiState = {
  isAiLoading: boolean;
  aiError?: string | null;
};

import { DocumentType } from '@/stores/documents-store';
import { EditorToolbar } from '@/components/Toolbar';

const generateReport = async (ticker: string, editor: Editor) => {
  const company = tickers.find((t) => t.value === ticker)?.label;

  if (!company) {
    return;
  }

  editor.commands.insertContent('<h1>' + company + '</h1>');

  const prompts = getPrompts(company);

  for (let i = 0; i < prompts.length; i++) {
    const res = await fetch('/api/generation', {
      method: 'POST',
      body: JSON.stringify({
        company,
        prompt: prompts[i].prompt,
      }),
    });
    const body = await res.json();
    editor.commands.insertContent('<h2>' + prompts[i].section + '</h2>');
    editor.commands.insertContent(
      '<p>' + body.response.replace(/\n/g, '') + '</p>',
    );
  }
};

interface OptionsState {
  type: string;
  companyTicker: string;
  recommendation: Recommendation;
  targetPrice?: string;
}

// TODO: turn this into a form hook
export default function Report({ params }: { params: { report: string } }) {
  const { report: reportId } = params;
  const { reports, setSelectedReport, updateReport, addDocuments } =
    useBoundStore((state) => state);
  const supabase = createServiceClient();
  const [isLoading, setIsLoading] = useState(false);

  const { editor, characterCount, isEmpty } = useBlockEditor(reportId);
  const menuContainerRef = useRef(null);

  const [options, setOptions] = useState<OptionsState>({
    type: '',
    companyTicker: '',
    recommendation: Recommendation.Auto,
    targetPrice: undefined,
  });

  const updateOption = (key: string, value: string) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const report = reports.find((r) => r.id === reportId);

  function getDocType(docType: string) {
    switch (docType) {
      case '10-K':
        return DocumentType.TenK;
      case '10-Q':
        return DocumentType.TenQ;
      case 'Earnings Calls':
        return DocumentType.EarningsCalls;
      default:
        return DocumentType.News;
    }
  }

  const fetchDocuments = useCallback(async () => {
    const documents = await supabase
      .from('documents')
      .select('*')
      .eq('company_ticker', report?.companyTicker);

    if (!documents.data) return;

    addDocuments(
      documents.data.map((doc) => ({
        ...doc,
        doc_type: getDocType(doc.doc_type),
      })),
    );
  }, [report, supabase, addDocuments]);

  useEffect(() => {
    if (!report) return;
    setSelectedReport(report);
    fetchDocuments();
  }, []);

  const companies = useMemo(
    () =>
      tickers.map((t) => ({
        label: `${t.value} - ${t.label}`,
        value: t.value,
      })),
    [],
  );

  if (!report) {
    return (
      <div>
        <p>Could not find a report</p>
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  const getDateName = () => {
    const currentDate = new Date();

    // Extract the month, day, and year from the current date
    const month = currentDate.toLocaleString('default', { month: 'short' });
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();

    // Format the date as "MMM DD, YYYY"
    const formattedDate = `${month} ${day}, ${year}`;
    return formattedDate;
  };

  // TODO: IMPORTANT - add all tickers

  type Option = { label: string; value: string };

  function SelectorComponent({
    topLabel,
    label,
    options,
    value,
    setValue,
    search,
    halfWidth,
  }: {
    topLabel: string;
    label: string;
    options: Option[];
    value: string;
    setValue: (value: string) => void;
    search: boolean;
    halfWidth?: boolean;
  }) {
    return (
      <div
        className={`${halfWidth ? 'w-[156px]' : 'w-80'} flex flex-col gap-1`}
      >
        <p className="text-sm text-zinc-600 font-semibold">{topLabel}</p>
        <Combobox
          label={label}
          options={options}
          value={value}
          setValue={setValue}
          search={search}
        />
      </div>
    );
  }
  // TODO: navbar and sidebar have to be in layout
  return (
    <div className="w-full h-screen flex flex-col">
      <TopBar editor={editor} />
      <div className="flex h-[calc(100vh-48px)]" ref={menuContainerRef}>
        <NavBar />
        {isEmpty && !report.companyTicker ? (
          <div className="bg-white rounded-t-[10px] border-[0.5px] border-stone-300 w-full py-8">
            <div className="flex flex-col w-fit mx-auto">
              <p className="w-fit text-xl text-zinc-600 font-semibold font-sans mb-6">
                Create New Report
              </p>
              <div
                className="flex flex-col gap-4 rounded-lg px-10 py-6"
                style={{
                  boxShadow: '0px 0px 4px 0px rgba(0,0,0,0.1) inset',
                  backgroundColor: '#F0F2F5',
                }}
              >
                <SelectorComponent
                  topLabel="Report Type"
                  label="Select a report type"
                  options={[
                    {
                      label: 'Equity Analyst Report',
                      value: 'EquityAnalyst',
                    },
                    {
                      label: 'Earnings Call Note',
                      value: 'EarningsCallNote',
                    },
                    { label: 'Other', value: 'Other' },
                  ]}
                  value={options.type}
                  setValue={(val) => updateOption('type', val)}
                  search={false}
                />
                {options.type && (
                  <SelectorComponent
                    topLabel="Company"
                    label="Select a company"
                    value={options.companyTicker}
                    options={companies}
                    setValue={(val) => updateOption('companyTicker', val)}
                    search={true}
                  />
                )}
                {options.type === 'EquityAnalyst' && (
                  <div className="flex gap-2">
                    <SelectorComponent
                      topLabel="Recommendation"
                      label=""
                      options={[
                        { label: 'Auto', value: Recommendation.Auto },
                        { label: 'Buy', value: Recommendation.Buy },
                        {
                          label: 'Overweight',
                          value: Recommendation.Overweight,
                        },
                        { label: 'Hold', value: Recommendation.Hold },
                        {
                          label: 'Underweight',
                          value: Recommendation.Underweight,
                        },
                        { label: 'Sell', value: Recommendation.Sell },
                      ]}
                      value={options.recommendation}
                      setValue={(val) => updateOption('recommendation', val)}
                      search={false}
                      halfWidth
                    />
                    <div className={`w-[156px] flex flex-col gap-1 relative`}>
                      <p className="text-sm text-zinc-600 font-semibold">
                        Target Price
                      </p>
                      <input
                        disabled={
                          options.recommendation === Recommendation.Auto
                        }
                        style={{ boxShadow: '0px 1px 2px 0px rgb(0,0,0,0.2)' }}
                        className={`${
                          options.recommendation === Recommendation.Auto &&
                          'bg-zinc-200 cursor-not-allowed'
                        } inline-flex h-10 items-center justify-between gap-1 rounded-md bg-white border-zinc-300 border-[0.5px] px-4 text-zinc-600 focus:border-zinc-400 pl-5 focus:outline-none appearance-none`}
                        value={
                          options.recommendation === Recommendation.Auto
                            ? ''
                            : options.targetPrice
                        }
                        onInput={(e) =>
                          updateOption('targetPrice', e.currentTarget.value)
                        }
                      />
                      <p className="absolute left-2 bottom-2.5 text-sm text-zinc-600">
                        $
                      </p>
                    </div>
                  </div>
                )}
                {/* TODO: add tooltip when disabled */}
                {options.type && options.companyTicker && (
                  <div className="flex flex-col gap-1">
                    <button className="mt-2 flex gap-1 items-center w-fit">
                      <p className="text-xs text-zinc-600 font-semibold">
                        Choose a template
                      </p>
                      <ChevronDown className="h-4 w-4 text-zinc-600" />
                    </button>

                    <button className="mt-2 flex gap-1 items-center w-fit">
                      <p className="text-xs text-zinc-600 font-semibold">
                        Edit sources
                      </p>
                      <ChevronDown className="h-4 w-4 text-zinc-600" />
                    </button>
                  </div>
                )}
                <div className="flex gap-4 w-full mt-2 mb-2">
                  <button
                    disabled={!options.companyTicker || !options.type}
                    style={{ boxShadow: '0px 1px 2px 0px rgb(0,0,0,0.2)' }}
                    className={`${
                      !options.companyTicker || !options.type
                        ? 'cursor-not-allowed text-zinc-400 bg-zinc-200'
                        : 'hover:border-zinc-400'
                    } flex gap-2 w-1/2 border-zinc-300  border text-zinc-600 bg-white py-2 items-center justify-center rounded-md px-[15px] font-medium leading-none focus:outline-none text-sm`}
                    onClick={() => {
                      if (!options.companyTicker || !options.type) return;
                      updateReport({
                        id: reportId,
                        title: `${getDateName()} - ${
                          ReportType[
                            (options.type as keyof typeof ReportType) ?? 'Other'
                          ]
                        }`,
                        ...options,
                        type: ReportType[
                          (options.type as keyof typeof ReportType) ?? 'Other'
                        ],
                        content: '',
                      });
                      console.log(reports);
                      // generateReport(options.company, editor);
                    }}
                  >
                    <SquarePen className="h-5 w-5" />
                    Start writing
                  </button>
                  <button
                    disabled={!options.companyTicker || !options.type}
                    style={{ boxShadow: '0px 1px 2px 0px rgb(0,0,0,0.2)' }}
                    className={`${
                      !options.companyTicker || !options.type
                        ? 'bg-indigo8 text-zinc-50 cursor-not-allowed'
                        : 'bg-indigo11 text-white'
                    } flex gap-2 items-center justify-center text-left w-1/2  rounded-md px-[15px] font-medium focus:shadow-[0_0_0_2px] focus:outline-none text-sm py-1`}
                    onClick={() => {
                      // console.log('generation report');
                      // generateReport(options.companyTicker, editor);

                      if (!options.companyTicker || !options.type) return;

                      function typeContent(
                        editor: Editor,
                        content: any[],
                        delay: number,
                      ) {
                        let index = 0;

                        function type() {
                          if (index < content.length) {
                            editor.commands.insertContent(content[index]);
                            index++;
                            setTimeout(type, delay);
                          }
                        }

                        type();
                      }

                      updateReport({
                        id: reportId,
                        title: `${getDateName()} - ${
                          ReportType[
                            (options.type as keyof typeof ReportType) ?? 'Other'
                          ]
                        }`,
                        ...options,
                        type: ReportType[
                          (options.type as keyof typeof ReportType) ?? 'Other'
                        ],
                        content: '',
                      });

                      typeContent(editor, newAmazonReport.content, 600);
                    }}
                  >
                    <Wand2Icon className="h-5 w-5" />
                    <div className="flex flex-col w-fit justify-start">
                      <p>Generate Full</p>
                      <p>Report</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-3 px-1 flex-1">
            <div className="relative flex flex-col h-full overflow-hidden rounded-t-[12px] shadow-finpanel bg-white border-zinc-300 border-[0.5px]">
              <div className="h-[44px] w-full">
                <EditorToolbar editor={editor} />
              </div>
              {/* TODO: Table of contents */}
              <ScrollArea.Root className="overflow-hidden h-full w-full ">
                <ScrollArea.Viewport className="h-full w-full">
                  <EditorContent editor={editor} className="flex-1" />
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar
                  className="flex select-none touch-none p-0.5 mt-3.5 mr-0.5 transition-colors duration-[160ms] ease-out data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                  orientation="vertical"
                >
                  <ScrollArea.Thumb className="flex-1 bg-gray-400 hover:bg-gray-500 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                </ScrollArea.Scrollbar>
              </ScrollArea.Root>

              <ContentItemMenu editor={editor} />
              <LinkMenu editor={editor} appendTo={menuContainerRef} />
              {/* <TextMenu editor={editor} /> */}
              <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
              <TableRowMenu editor={editor} appendTo={menuContainerRef} />
              <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
              <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
            </div>
          </div>
        )}
        <RightSideBar />
      </div>
    </div>
  );
}
