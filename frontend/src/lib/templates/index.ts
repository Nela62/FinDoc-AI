// add react lazy loading
import { TemplateConfig } from '@/types/template';
import {
  EquityAnalystSidebarProps,
  equityAnalystSidebar,
} from './docx/equityAnalystSidebar/main';

type Templates = Record<
  string,
  (props: EquityAnalystSidebarProps & TemplateConfig) => Promise<Blob>
>;

export const TEMPLATES: Templates = {
  'equity-analyst-sidebar': equityAnalystSidebar,
};
