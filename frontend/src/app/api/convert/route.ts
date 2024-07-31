import { NextResponse } from 'next/server';
// import ConvertAPI from 'convertapi';
import {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  CreatePDFJob,
  CreatePDFResult,
  // SDKError,
  // ServiceUsageError,
  // ServiceApiError,
} from '@adobe/pdfservices-node-sdk';
import { Readable } from 'stream';

async function blobToNodeReadableStream(blob: Blob): Promise<Readable> {
  const buffer = await blob.arrayBuffer();
  const readableStream = new Readable({
    read() {
      this.push(Buffer.from(buffer));
      this.push(null);
    },
  });
  return readableStream;
}

async function streamToBlob(stream: NodeJS.ReadableStream): Promise<Blob> {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return new Blob(chunks, { type: 'application/octet-stream' });
}

export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get('file') as Blob | null;

  if (!file) {
    return NextResponse.json(
      { error: 'File blob is required.' },
      { status: 400 },
    );
  }

  console.log('getting a pdf template');

  if (
    !process.env.PDF_SERVICES_CLIENT_ID ||
    !process.env.PDF_SERVICES_CLIENT_SECRET
  ) {
    throw new Error(
      'PDF_SERVICES_CLIENT_ID and PDF_SERVICES_CLIENT_SECRET are required',
    );
  }

  try {
    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET,
    });

    const pdfServices = new PDFServices({ credentials });

    const readStream = await blobToNodeReadableStream(file);

    const inputAsset = await pdfServices.upload({
      readStream,
      mimeType: MimeType.DOCX,
    });

    // Creates a new job instance
    const job = new CreatePDFJob({ inputAsset });

    // Submit the job and get the job result
    const pollingURL = await pdfServices.submit({ job });
    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: CreatePDFResult,
    });

    // Get content from the resulting asset(s)
    const resultAsset = pdfServicesResponse.result?.asset;

    if (!resultAsset) {
      return NextResponse.json(
        { error: 'The output is empty.' },
        { status: 500 },
      );
    }

    const streamAsset = await pdfServices.getContent({ asset: resultAsset });
    const blob = await streamToBlob(streamAsset.readStream);

    const response = new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="output.pdf"',
      },
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);

      return new NextResponse(null, {
        status: 500,
        statusText: 'Internal Server Error',
      });
    }
  }
}
