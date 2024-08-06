import { NextResponse } from 'next/server';
import { getBlock } from '../../(protected)/reports/utils/buildingBlocksContext';
import { serviceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';
import { Logger } from 'next-axiom';

const supabase = serviceClient();

const MAX_CONCURRENT_TASKS = 5;

export async function POST(req: Request) {
  const log = new Logger();

  try {
    const client = createClient();

    const userRes = await client.auth.getUser();

    if (!userRes.data.user) {
      return Response.json(
        {
          error: 'Unauthorized access',
          message: 'User not found or invalid credentials',
        },
        { status: 401 },
      );
    }

    const json = await req.json();

    // Check if the maximum number of concurrent tasks is reached
    const { count } = await supabase
      .from('ai_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing');

    if (count && count >= MAX_CONCURRENT_TASKS) {
      // If the limit is reached, add the task to the queue
      const { data, error } = await supabase
        .from('ai_jobs')
        .insert({
          block_id: json.blockId,
          status: 'queued',
        })
        .select();

      if (error) {
        console.error('Error creating task:', error);
        return NextResponse.json(
          { error: 'Failed to create task' },
          { status: 500 },
        );
      }

      return NextResponse.json({ jobId: data[0].id });
    }

    // If the limit is not reached, start processing the task immediately
    const { data, error } = await supabase
      .from('ai_jobs')
      .insert({
        block_id: json.blockId,
        status: 'processing',
      })
      .select();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 },
      );
    }

    // Start processing the task asynchronously
    processTask(data[0].id, json);

    return NextResponse.json({ jobId: data[0].id });
  } catch (err) {
    if (err instanceof Error) {
      log.error('Failed to process the block', err);
      return NextResponse.json(
        {
          error: 'Failed to process the block: ' + err.message,
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      {
        error: 'Failed to process the block',
      },
      { status: 500 },
    );
  }
}

async function processTask(jobId: string, json: any) {
  const log = new Logger();

  try {
    const { content, inputTokens, outputTokens } = await getBlock(json);

    // Update the task status to 'completed' and store the block data
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

    // Check if there are any queued tasks
    const { data: queuedTasks, error } = await supabase
      .from('ai_jobs')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) {
      throw new Error('Error retrieving queued tasks: ' + error);
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
        processTask(queuedTask.id, { ...json, blockId: queuedTask.block_id });
      } catch (err) {
        log.error('Error removing a queued task', { id: queuedTasks[0].id });
        throw new Error('Error removing a queued task');
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      log.error('Error processing ai task', error);

      try {
        const e = JSON.parse(error.message);
        if (e?.status === 429) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * e.headers['retry-after']),
          );
          await supabase
            .from('ai_jobs')
            .update({ status: 'queued' })
            .eq('id', jobId);
        }
      } catch (err) {}

      // Update the task status to 'failed' if an error occurs
      await supabase
        .from('ai_jobs')
        .update({ status: 'failed', error: error.message })
        .eq('id', jobId);
    }
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (!jobId || jobId === 'undefined') {
    return NextResponse.json(
      { error: 'Missing jobId parameter' },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from('ai_jobs')
    .select('status, block_data')
    .eq('id', jobId)
    .single();

  if (error) {
    console.error('Error retrieving job:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve job' },
      { status: 500 },
    );
  }

  return NextResponse.json({ status: data.status, block: data.block_data });
}
