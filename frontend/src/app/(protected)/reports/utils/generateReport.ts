import { z } from 'zod';
import { reportFormSchema } from '../components/report/ReportForm';
import { SubscriptionPlan } from '@/types/subscription';
import { TemplateConfig } from '../components/NewReport';

export const generateReport = async (
  values: z.infer<typeof reportFormSchema>,
  plan: SubscriptionPlan,
  templateConfig: TemplateConfig,
) => {
  try {
  } catch (err) {}
};
