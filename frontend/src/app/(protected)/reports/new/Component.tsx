'use client';

import { fetchSettings, fetchTemplates } from '@/lib/queries';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { useDirectory } from '@supabase-cache-helpers/storage-react-query';
import { useEffect, useState } from 'react';
import { TemplatePreview } from './components/TemplatePreview';
import { Skeleton } from '@/components/ui/skeleton';
import { getPdfTemplate } from './utils/getPdfTemplate';

const defaultCompanyLogo = '/default_finpanel_logo.png';

export type TemplateConfig = {
  authorName: string;
  authorCompanyName: string;
  colorScheme: string;
  colorSchemesList: string[];
  authorCompanyLogo?: string;
  authorCompanyLogosList: string[];
};

export const NewReport = ({ userId }: { userId: string }) => {
  const [reportData, setReportData] = useState();
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(
    null,
  );

  const supabase = createClient();

  const { data: templates } = useQuery(fetchTemplates(supabase));

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
        colorScheme: settings[0].color_schemes[0],
        colorSchemesList: settings[0].color_schemes,
        authorCompanyLogo: logos.length > 0 ? logos[0].name : undefined,
        authorCompanyLogosList: logos.map((logo) => logo.name),
      });
    }
  }, [settings, logos]);

  useEffect(() => {
    templateConfig && getPdfTemplate(templateConfig);
  }, [templateConfig]);

  return <div>{templateConfig ? <TemplatePreview /> : <Skeleton />}</div>;
};
