import { Params } from '@/app/api/building-block/utils/blocks';
import { Logger } from 'next-axiom';
import { Dispatch, SetStateAction } from 'react';

export type JobStatus = 'processing' | 'completed' | 'failed' | 'queued';

export type Job = { blockId: string; status: JobStatus; block: string };

const log = new Logger();

export const createJob = async (
  params: Params,
  setJobs: Dispatch<SetStateAction<Record<string, Job>>>,
) => {
  try {
    const { jobId, error } = await fetch(`/api/building-block`, {
      method: 'POST',
      body: JSON.stringify(params),
    }).then((res) => {
      return res.json();
    });

    if (error) {
      throw new Error(error);
    }

    setJobs((prevJobs) => ({
      ...prevJobs,
      [jobId]: { blockId: params.blockId, status: 'processing' },
    }));
    return jobId;
  } catch (error) {
    log.error('Error creating a job', {
      error: error instanceof Error ? error.message : '',
      ...params,
    });
    throw error;
  }
};

export const waitForJobCompletion = async (jobId: string) => {
  while (true) {
    const { status, block } = await fetch(`/api/building-block?jobId=${jobId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Error fetching a job status: ${res.status}. Job id: ${jobId}`,
          );
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
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error('Error fetching SEC job status: ' + jobId);
          }
          return res.json();
        })
        .catch((error) => {
          throw error;
        });

      if (status === 'completed') {
        return status;
      } else if (status === 'failed') {
        throw new Error('Job failed: ' + jobId);
      } else if (error) {
        throw new Error(error);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before polling again
    }
  } catch (err) {
    throw err;
  }
};

export const waitForAllJobs = async (jobs: Record<string, string>[]) => {
  let results: Record<string, any> = {};

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
