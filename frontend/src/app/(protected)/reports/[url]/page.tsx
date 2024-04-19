import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { prefetchQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { cookies } from 'next/headers';

import { ContentItemMenu, LinkMenu, TextMenu } from '@/components/menus';
import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu';
import { ColumnsMenu } from '@/extensions/MultiColumn/menus';
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus';
import { useBlockEditor } from '@/hooks/useBlockEditor';
import { Editor, EditorContent } from '@tiptap/react';
import 'ldrs/ring';

import { useLogger } from 'next-axiom';

import * as ScrollArea from '@radix-ui/react-scroll-area';

import '@/styles/index.css';
import { SquarePen, X, Wand2Icon, ChevronDown } from 'lucide-react';
import { Combobox } from '@/components/ui/OldCombobox';
import { tickers } from '@/lib/data/tickers';
import { getPrompts } from './prompts';
import { TopBar } from '@/components/TopBar/TopBar';
import { RightSideBar } from '@/components/RightSidebar';
import {
  newAmazonReport,
  newAmazonReportHtml,
  newAmazonReportMarkdown,
} from '@/lib/data/newAmazonReport';
import { Recommendation, ReportType } from '@/stores/reports-store';
import { useBoundStore } from '@/providers/store-provider';
export type AiState = {
  isAiLoading: boolean;
  aiError?: string | null;
};

import { DocumentType } from '@/stores/documents-store';
import { EditorToolbar } from '@/components/Toolbar';
import { EditorComponent } from './EditorComponent';
import { createClient } from '@/lib/supabase/server';
import { getReportById } from '@/lib/queries';
import { redirect } from 'next/navigation';

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
export default async function Report({ params }: { params: { url: string } }) {
  const queryClient = new QueryClient();
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  await prefetchQuery(queryClient, getReportById(supabase, params.url));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditorComponent url={params.url} />
    </HydrationBoundary>
  );
}
