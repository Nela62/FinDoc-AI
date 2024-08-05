import { Params } from '@/app/api/building-block/utils/blocks';
import { serviceClient } from '@/lib/supabase/service';
import { ServerError } from '@/types/error';
import { Logger } from 'next-axiom';

export type JobStatus = 'processing' | 'completed' | 'failed' | 'queued';

export type Job = { blockId: string; status: JobStatus; block: string };

const log = new Logger();
const supabase = serviceClient();

const MAX_CONCURRENT_TASKS = 5;

export const createJob = async (params: Params) => {
  try {
    const { count } = await supabase
      .from('ai_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing');

    if (count && count >= MAX_CONCURRENT_TASKS) {
      // If the limit is reached, add the task to the queue
      const { data, error } = await supabase
        .from('ai_jobs')
        .insert({
          block_id: params.blockId,
          status: 'queued',
        })
        .select();

      if (error || !data) {
        log.error('Error creating task:', {
          error,
          fnName: 'Fetching ai_jobs in createJob',
          fnInputs: { params },
        });
        throw new ServerError('Error creating an AI job');
      }

      return data[0].id;
    }

    const { jobId } = await fetch(`/api/building-block`, {
      method: 'POST',
      body: JSON.stringify(params),
    }).then((res) => {
      if (!res.ok) {
        log.error('Error generating a building block', {
          error: res.statusText,
          params,
        });
        throw new ServerError(
          'Error generating a building block: ' + params.blockId,
        );
      }
      return res.json();
    });

    // setJobs((prevJobs) => ({
    //   ...prevJobs,
    //   [jobId]: { blockId: params.blockId, status: 'processing' },
    // }));
    return jobId;
  } catch (error) {
    if (error instanceof Error) {
      log.error('Error creating a job', {
        error: error.message,
        ...params,
      });
    }
    throw error;
  }
};

export const waitForJobCompletion = async (jobId: string) => {
  while (true) {
    const { status, block } = await fetch(`/api/building-block?jobId=${jobId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error fetching a job status: ' + jobId);
        }
        return res.json();
      })
      .catch((e) => {
        throw e;
      });

    if (status === 'completed') {
      return block;
    } else if (status === 'failed') {
      throw new Error('Job failed: ' + jobId);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

export const waitForSecJobCompletion = async (jobId: string) => {
  try {
    while (true) {
      const { status, error } = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sec-filing/status/${jobId}`,
      ).then((res) => {
        if (!res.ok) {
          log.error('Error fetching SEC job status', { jobId });
          throw new ServerError('Error fetching SEC job status: ' + jobId);
        }
        return res.json();
      });

      if (status === 'completed') {
        return status;
      } else if (status === 'failed') {
        log.error('Job failed', { jobId });
        throw new ServerError('Job failed: ' + jobId);
      } else if (error) {
        log.error('Unexpected error', { error, jobId });
        throw new ServerError(error);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before polling again
    }
  } catch (err) {
    log.error('Error waiting for SEC job completion', { jobId });
    throw err;
  }
};

export const waitForAllJobs = async (jobs: Record<string, string>[]) => {
  let results: Record<string, any> = {};
  const log = new Logger();

  try {
    await Promise.all(
      jobs.map(async (job) => {
        try {
          const res = await waitForJobCompletion(job.id);
          results[job.blockId] = res;
        } catch (err) {
          log.error('Failed to generate the block', {
            blockId: job.blockId,
            jobId: job.id,
          });
          results[job.blockId] = '';
        }
      }),
    );

    return results;
  } catch (err) {
    throw err;
  }
};
