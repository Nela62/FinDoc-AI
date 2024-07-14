import { Params } from '@/app/api/building-block/utils/blocks';
import { Dispatch, SetStateAction } from 'react';

export type JobStatus = 'processing' | 'completed' | 'failed' | 'queued';

export type Job = { blockId: string; status: JobStatus; block: string };

export const createJob = async (
  params: Params,
  setJobs: Dispatch<SetStateAction<Record<string, Job>>>,
  setError: Dispatch<SetStateAction<string | null>>,
) => {
  try {
    const { jobId } = await fetch(`/api/building-block`, {
      method: 'POST',
      body: JSON.stringify(params),
    }).then((res) => res.json());

    setJobs((prevJobs) => ({
      ...prevJobs,
      [jobId]: { blockId: params.blockId, status: 'processing' },
    }));
    return jobId;
  } catch (error) {
    setError('Failed to create job');
    throw error;
  }
};

export const waitForJobCompletion = async (jobId: string) => {
  while (true) {
    const { status, block } = await fetch(`/api/building-block?jobId=${jobId}`)
      .then((res) => res.json())
      .catch((e) => {
        console.error(e);
        throw e;
      });

    if (status === 'completed') {
      return block;
    } else if (status === 'failed') {
      throw new Error('Job failed');
    }

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before polling again
  }
};

export const waitForSecJobCompletion = async (jobId: string) => {
  while (true) {
    const { status, error } = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/sec-filing/status/${jobId}`,
    )
      .then((res) => res.json())
      .catch((e) => {
        console.error(e);
        throw error;
      });

    if (status === 'completed') {
      return status;
    } else if (status === 'failed') {
      throw new Error('Job failed');
    } else if (error) {
      throw new Error(error);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before polling again
  }
};

export const waitForAllJobs = async (jobs: Record<string, string>[]) => {
  let results: Record<string, any> = {};
  await Promise.all(
    jobs.map(async (job) => {
      const res = await waitForJobCompletion(job.id);
      results[job.blockId] = res;
    }),
  );
  return results;
};
