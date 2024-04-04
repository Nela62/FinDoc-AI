'use client';

import { NavBar } from '@/components/NavBar';
import { ContentItemMenu, LinkMenu, TextMenu } from '@/components/menus';
import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu';
import { ColumnsMenu } from '@/extensions/MultiColumn/menus';
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus';
import { useBlockEditor } from '@/hooks/useBlockEditor';
import { Content, Editor, EditorContent } from '@tiptap/react';

import * as Select from '@radix-ui/react-select';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import '@/styles/index.css';
import { AiChat } from '@/components/chat';
import { useSearchParams } from 'next/navigation';
import {
  ChevronsUpDown,
  SquarePen,
  X,
  Wand2Icon,
  ChevronDown,
  ChevronDownIcon,
} from 'lucide-react';
import { Combobox } from '@/components/ui/Combobox';
import { tickers } from '@/lib/data/tickers';
import { getPrompts } from './prompts';
import { TopBar } from '@/components/TopBar/TopBar';
import { ReportType, useReportsStateStore } from '@/store';
import { initialContent } from '@/lib/data/initialContent';
import { DropdownButton } from '@/components/ui/Dropdown';
export type AiState = {
  isAiLoading: boolean;
  aiError?: string | null;
};

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

export default function Report({ params }: { params: { report: string } }) {
  const { report: reportId } = params;
  const reports = useReportsStateStore((state) => state.reports);
  const setSelectedReport = useReportsStateStore((s) => s.setSelectedReport);
  const [content, setContent] = useState<string | Content | null>(null);
  const [isNew, setIsNew] = useState(false);
  // const isNew = useSearchParams().get('isNew') === 'true';

  const { editor, characterCount, isEmpty } = useBlockEditor(reportId);
  const menuContainerRef = useRef(null);

  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('');

  const report = reports.find((r) => r.id === reportId);

  useEffect(() => {
    if (!report) return;
    setSelectedReport(report);
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

  type Option = { label: string; value: string };

  function SelectorComponent({
    topLabel,
    label,
    options,
    value,
    setValue,
    search,
  }: {
    topLabel: string;
    label: string;
    options: Option[];
    value: string;
    setValue: (value: string) => void;
    search: boolean;
  }) {
    return (
      <div className="flex flex-col gap-1 w-80">
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

  return (
    <div className="flex h-full" ref={menuContainerRef}>
      <NavBar />
      {isEmpty ? (
        <div className="bg-white rounded-t-[12px] border-[0.5px] border-stone-300 w-full mt-10 py-8">
          <div className="flex flex-col w-fit mx-auto">
            <p className="w-fit text-xl text-zinc-600 font-semibold font-sans mb-6">
              Create New Report
            </p>
            <div
              className="flex flex-col gap-2 bg-zinc-50 rounded-lg px-10 py-6"
              style={{ boxShadow: '0px 0px 4px 0px rgba(0,0,0,0.1) inset' }}
            >
              <SelectorComponent topLabel="Company" label="Select a company" />
              <div className="flex flex-col gap-1 w-80">
                <p className="text-sm text-zinc-600 font-semibold">Company</p>
                <Combobox
                  label="Select a company"
                  options={companies}
                  value={selectedCompany}
                  setValue={setSelectedCompany}
                  search={true}
                />
              </div>
              <div className="flex flex-col gap-1 w-80 mt-2">
                <p className="text-sm text-zinc-600 font-semibold">
                  Report Type
                </p>
                {/* TODO: create a dropdown button in ui */}
                <Combobox
                  label="Select a report type"
                  options={[
                    { label: 'Equity Analyst Report', value: 'equity_analyst' },
                    { label: 'Earnings Call Note', value: 'earnings_call' },
                  ]}
                  value={selectedReportType}
                  setValue={setSelectedReportType}
                  search={false}
                />
              </div>
              <div className="mt-2 flex gap-1 items-center">
                <p className="text-xs text-zinc-600 font-semibold">
                  Choose a template
                </p>
                <ChevronDown className="h-4 w-4 text-zinc-600" />
              </div>

              <div className="mt-2 flex gap-1 items-center">
                <p className="text-xs text-zinc-600 font-semibold">
                  Edit sources
                </p>
                <ChevronDown className="h-4 w-4 text-zinc-600" />
              </div>
              <div className="flex gap-4 w-full mt-4 mb-2">
                <button
                  style={{ boxShadow: '0px 1px 2px 0px rgb(0,0,0,0.2)' }}
                  className="flex gap-2 w-1/2 border-zinc-300 border text-zinc-600 bg-white py-2 items-center justify-center rounded-md px-[15px] font-medium leading-none focus:outline-none text-sm"
                  onClick={() => {
                    console.log('generation report');
                    generateReport(selectedCompany, editor);
                  }}
                >
                  <SquarePen className="h-5 w-5" />
                  Start writing
                </button>
                <button
                  style={{ boxShadow: '0px 1px 2px 0px rgb(0,0,0,0.2)' }}
                  className="flex gap-2 items-center justify-center text-left w-1/2 bg-indigo11 text-white  rounded-md px-[15px] font-medium focus:shadow-[0_0_0_2px] focus:outline-none text-sm py-1"
                  onClick={() => {
                    console.log('generation report');
                    generateReport(selectedCompany, editor);
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
        <div className="flex w-full h-full flex-col">
          <TopBar editor={editor} />
          <div className="relative flex flex-col flex-1 h-full overflow-hidden">
            {/* TODO: Table of contents */}
            <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
            <ContentItemMenu editor={editor} />
            <LinkMenu editor={editor} appendTo={menuContainerRef} />
            <TextMenu editor={editor} />
            <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
            <TableRowMenu editor={editor} appendTo={menuContainerRef} />
            <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
            <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
          </div>
        </div>
      )}
    </div>
  );
}
