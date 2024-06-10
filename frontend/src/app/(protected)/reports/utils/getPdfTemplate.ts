'use server';

import ConvertAPI from 'convertapi';

export const getPdfTemplate = async (docxBlob: Blob) => {
  console.log('getting a pdf template');

  if (!process.env.CONVERT_API_KEY) {
    throw new Error('CONVERT_API_KEY is required');
  }

  const convertapi = new ConvertAPI(process.env.CONVERT_API_KEY);

  try {
    const result = await convertapi.convert('pdf', { File: docxBlob });
    return result.file.url;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw new Error(error.message);
    }
  }
  throw new Error('geting pdf failed');
};
