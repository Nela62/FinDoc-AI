import { serviceClient } from '@/lib/supabase/service';
import { ServerError } from '@/types/error';
import { Logger } from 'next-axiom';
import { getBlock } from './buildingBlocksContext';
import { BuildingBlockParams } from './buildingBlocks';

export type JobStatus = 'processing' | 'completed' | 'failed' | 'queued';

export type Job = { blockId: string; status: JobStatus; block: string };

const log = new Logger();
const supabase = serviceClient();

const MAX_CONCURRENT_TASKS = 5;

const processTask = async (jobId: string) => {
  const { data, error: jobError } = await supabase
    .from('ai_jobs')
    .select('*')
    .eq('id', jobId)
    .maybeSingle();

  if (jobError || !data) {
    log.error('Error retrieving job', {
      error: jobError,
      fnName: 'Fetching ai_jobs in processTask',
      jobId,
    });
    throw new ServerError('Error retrieving job: ' + jobId);
  }
  try {
    const { content, inputTokens, outputTokens } = await getBlock(data.params);

    await supabase
      .from('ai_jobs')
      .update({
        status: 'completed',
        block_data: content,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        finished_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Rate limit error') {
        await supabase
          .from('ai_jobs')
          .update({ status: 'queued' })
          .eq('id', jobId);
      } else {
        await supabase
          .from('ai_jobs')
          .update({
            status: 'completed',
            block_data: '',
            input_tokens: 0,
            output_tokens: 0,
            error: err.message,
            finished_at: new Date().toISOString(),
          })
          .eq('id', jobId);
      }
    }
  }
  // Check if there are any queued tasks
  const { data: queuedTasks, error } = await supabase
    .from('ai_jobs')
    .select('*')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(1);

  if (error) {
    log.error('Error retrieving queued tasks', {
      error,
      fnName: 'Fetching ai_jobs in processTask',
      jobId,
    });
    throw new ServerError('Error retrieving queued tasks: ' + error);
  }

  if (queuedTasks.length > 0) {
    try {
      const queuedTask = queuedTasks[0];

      // Update the queued task status to 'processing'
      await supabase
        .from('ai_jobs')
        .update({ status: 'processing' })
        .eq('id', queuedTask.id);

      // Process the next queued task
      processTask(queuedTask.id);
    } catch (err) {
      log.error('Error removing a queued task', { id: queuedTasks[0].id });
      throw new ServerError('Error removing a queued task');
    }
  }
};

export const createJob = async (params: BuildingBlockParams) => {
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
          params,
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
    } else {
      const { data, error } = await supabase
        .from('ai_jobs')
        .insert({
          block_id: params.blockId,
          status: 'processing',
          params,
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

      // Start processing the task asynchronously
      await processTask(data[0].id);
      return data[0].id;
    }
  } catch (error) {
    if (error instanceof Error) {
      log.error('Error creating a job', {
        error: error.message,
        params,
      });
    }
    throw error;
  }
};

export const waitForJobCompletion = async (jobId: string) => {
  while (true) {
    const { data, error } = await supabase
      .from('ai_jobs')
      .select('status, block_data')
      .eq('id', jobId)
      .maybeSingle();

    if (error || !data) {
      log.error('Error retrieving job', {
        error,
        fnName: 'Fetching ai_jobs in waitForJobCompletion',
        jobId,
      });
      throw new ServerError('Error retrieving job: ' + jobId);
    }

    if (data.status === 'completed') {
      return data.block_data;
    } else if (data.status === 'failed') {
      log.error('Job failed', { jobId });
      throw new ServerError('Job failed: ' + jobId);
    }

    console.log('Waiting before next check');

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
