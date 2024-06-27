import { NextResponse } from 'next/server';
import { getBlock } from './utils/blocks';
import { serviceClient } from '@/lib/supabase/service';

// TODO: check if this is authenticated
// export async function POST(req: Request) {
//   const json = await req.json();

//   console.log('generating block ' + json.blockId);

//   const block = await getBlock(json);

//   return NextResponse.json({ block: block });
// }

const supabase = serviceClient();

const MAX_CONCURRENT_TASKS = 5; // Maximum number of concurrent tasks

export async function POST(req: Request) {
  const json = await req.json();
  console.log('generating block ' + json.blockId);

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

  console.log(json.blockId + ' ' + data[0].id);

  // Start processing the task asynchronously
  processTask(data[0].id, json);

  return NextResponse.json({ jobId: data[0].id });
}

async function processTask(jobId: string, json: any) {
  try {
    const {
      content,
      inputTokens,
      outputTokens,
      error: generationError,
    } = await getBlock(json);

    if (generationError) {
      console.error('Error generating the block:', generationError);
      return;
    }

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
      console.error('Error retrieving queued tasks:', error);
      return;
    }

    if (queuedTasks.length > 0) {
      const queuedTask = queuedTasks[0];

      // Update the queued task status to 'processing'
      await supabase
        .from('ai_jobs')
        .update({ status: 'processing' })
        .eq('id', queuedTask.id);

      // Process the next queued task
      processTask(queuedTask.id, { ...json, blockId: queuedTask.block_id });
    }
  } catch (error) {
    console.error('Error processing task:', error);
    // @ts-ignore
    if (error.status === 529) {
      await supabase
        .from('ai_jobs')
        .update({ status: 'queued' })
        .eq('id', jobId);
    }

    // Update the task status to 'failed' if an error occurs
    await supabase
      .from('ai_jobs')
      .update({ status: 'failed', error: error })
      .eq('id', jobId);
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
