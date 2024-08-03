import { createClient } from '@/lib/supabase/server';
import { Logger } from 'next-axiom';

const log = new Logger();

export interface Response {
  error: string | null;
}

export const updateUser = async (
  companyName: string,
  analystName: string,
  role: string,
  frequency: string,
): Promise<Response> => {
  'use server';

  try {
    const supabase = createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData) {
      log.error('Error occurred', {
        error: userError ?? { message: 'Could not getUser during onboarding' },
        fnName: 'updateUser, supabase.auth.getUser()',
        fnInputs: { companyName, analystName, role, frequency },
      });

      return { error: 'An error occurred during onboarding' };
    } else {
      await supabase.from('settings').insert({
        user_id: userData.user.id,
        company_name: companyName,
        author_name: analystName,
      });
      await supabase
        .from('profiles')
        .update({
          role,
          sec_filings_frequency: frequency,
        })
        .eq('user_id', userData.user.id);
      await supabase.auth.updateUser({ data: { finished_onboarding: true } });
      log.info('Successfully updated user settings and profile', {
        user_id: userData.user.id,
        companyName,
        analystName,
        role,
        frequency,
      });

      return { error: null };
    }
  } catch (err) {
    log.error('Error occurred', {
      error: err,
      fnName: 'updateUser, supabase.auth.getUser()',
      fnInputs: { companyName, analystName, role, frequency },
    });
    return { error: 'An error occurred during onboarding' };
  }
};
