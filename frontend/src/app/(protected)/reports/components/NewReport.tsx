'use client';

import {
  fetchSettings,
  fetchSubscription,
  fetchTemplates,
} from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { useDirectory } from '@supabase-cache-helpers/storage-react-query';
import { useEffect, useState } from 'react';
import { TemplatePreview } from './template/TemplatePreview';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportForm } from './report/ReportForm';
import { JSONContent } from '@tiptap/core';
import { TemplateCustomizationForm } from './template/TemplateCustomizationForm';
import { AllReportsColumn } from './allReports/AllReportsColumn';
import { ReportInfo } from './allReports/ReportInfo';
import { ReportPreview } from './allReports/ReportPreview';
import { SubscriptionPlan } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { initializeReportData } from '../utils/initializeReportData';
import { generateReport } from '../utils/generateReport';

type ColorScheme = { id: string; colors: string[] };

const COLOR_SCHEMES: ColorScheme[] = [
  { id: 'blue', colors: ['#1c4587', '#f4e9d3', '#006f3b'] },
  { id: 'red', colors: ['#7d1f1f', '#f4e9d3', '#006f3b'] },
  { id: 'white', colors: ['#787878', '#cce8fb', '#0061d9'] },
];

export type TemplateConfig = {
  authorName: string;
  authorCompanyName: string;
  colorScheme: ColorScheme;
  colorSchemesList: ColorScheme[];
  authorCompanyLogo?: string;
  authorCompanyLogosList: string[];
};

export type TemplateData = {
  id: string;
  name: string;
  reportType: string;
  sampleText: JSONContent;
  sectionIds: string[];
  componentId: string;
  businessDescription?: string;
  summary?: string[];
};

export const NewReport = ({ userId }: { userId: string }) => {
  const [isTemplateCustomization, setIsTemplateCustomization] = useState(false);
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(
    null,
  );
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [reportType, setReportType] = useState<string>('Equity Analyst Report');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const supabase = createClient();

  const { data: templates } = useQuery(fetchTemplates(supabase));
  const { data: planData } = useQuery(fetchSubscription(supabase));

  const { data: settings } = useQuery(fetchSettings(supabase));
  const { data: logos } = useDirectory(
    supabase.storage.from('company-logos'),
    userId,
    { refetchOnWindowFocus: false },
  );

  useEffect(() => {
    if (settings && settings.length > 0 && logos) {
      setTemplateConfig({
        authorName: settings[0].author_name,
        authorCompanyName: settings[0].company_name,
        colorScheme: COLOR_SCHEMES[0],
        colorSchemesList: COLOR_SCHEMES,
        // colorScheme: settings[0].color_schemes[0],
        // colorSchemesList: settings[0].color_schemes,
        authorCompanyLogo: logos.length > 0 ? logos[0].name : undefined,
        authorCompanyLogosList: logos.map((logo) => logo.name),
      });
    }
  }, [settings, logos]);

  useEffect(() => {
    if (templates && reportType) {
      if (templates.length > 0) {
        const template = templates.find(
          (template) => template.report_type === reportType,
        );

        if (!template) {
          throw new Error('No templates found for this report type.');
        }

        setTemplateData({
          id: template.id,
          name: template.name,
          reportType: template.report_type,
          businessDescription: template.business_description ?? undefined,
          summary: template.summary ?? undefined,
          sampleText: template.sample_text as JSONContent,
          sectionIds: template.section_ids,
          componentId: template.component_id,
        });
      } else {
        throw new Error('No templates were found.');
      }
    }
  }, [templates, reportType]);

  return (
    <div className="w-full border-t flex bg-muted/40">
      <div className="grow">
        <AllReportsColumn
          userId={userId}
          selectedReportId={selectedReportId}
          setSelectedReportId={setSelectedReportId}
        />
      </div>
      <div className="min-w-[420px] w-[28%]">
        {selectedReportId ? (
          <ReportInfo
            reportId={selectedReportId}
            userId={userId}
            plan={planData ? (planData[0].plan as SubscriptionPlan) : 'free'}
          />
        ) : isTemplateCustomization ? (
          templateConfig && templateData ? (
            <TemplateCustomizationForm
              userId={userId}
              templateData={templateData}
              templateConfig={templateConfig}
              setTemplateConfig={setTemplateConfig}
              setIsTemplateCustomization={setIsTemplateCustomization}
            />
          ) : (
            <Skeleton />
          )
        ) : (
          <ReportForm
            setIsTemplateCustomization={setIsTemplateCustomization}
            setSelectedReportId={setSelectedReportId}
            templateConfig={templateConfig}
            setReportType={setReportType}
            userId={userId}
            plan={planData ? (planData[0].plan as SubscriptionPlan) : 'free'}
            initializeReportData={initializeReportData}
            generateReport={generateReport}
          />
        )}
      </div>
      {selectedReportId ? (
        <ReportPreview userId={userId} reportId={selectedReportId} />
      ) : templateData ? (
        <TemplatePreview userId={userId} templateData={templateData} />
      ) : (
        <Skeleton className="w-[50%] h-full" />
      )}
    </div>
  );
};
