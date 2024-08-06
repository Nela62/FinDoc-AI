import { ServerError } from '@/types/error';
import { Logger } from 'next-axiom';
import { waitForSecJobCompletion } from './jobs';

const log = new Logger();

export const fetchSecFiling = async (ticker: string): Promise<string> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/sec-filing/${ticker}/10-K`;

  try {
    const response = await fetch(apiUrl, { cache: 'no-store' });

    if (!response.ok) {
      log.error('Error occurred', {
        message: 'Error when fetching SEC filing',
        ticker,
        response,
      });

      throw new ServerError('Error when fetching SEC filing');
    }

    let data = await response.json();

    if (data.status === 'processing' || data.status === 'pending') {
      await waitForSecJobCompletion(data.job_id);

      // Fetch again after job completion
      const newResponse = await fetch(apiUrl, { cache: 'no-store' });

      if (!newResponse.ok) {
        log.error('Error occurred', {
          message: 'Error when downloading SEC filing',
          ticker,
          newResponse,
        });

        throw new ServerError('Error when downloading SEC filing');
      }

      data = await newResponse.json();
    }

    if (data.status === 'available') {
      return data.xml_path;
    } else {
      log.error('Error occurred', {
        message: 'Unexpected SEC filing job status',
        ticker,
        status: data.status,
      });

      throw new ServerError('Unexpected SEC filing job status');
    }
  } catch (error) {
    log.error('Unexpected error occurred', {
      error,
      ticker,
      fnName: 'getSecFiling',
    });
    throw new ServerError('Unexpected error occurred');
  }
};
