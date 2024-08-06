'use server';

import { serviceClient } from '@/lib/supabase/service';
import { Logger } from 'next-axiom';
import { ServerError } from '@/types/error';
import { TickerData } from './reportUtils';
import { createClient } from '@/lib/supabase/server';

const log = new Logger();

export const cleanLink = (link: string): string => {
  let cleanLink = link;

  if (cleanLink.startsWith('http://')) {
    cleanLink = cleanLink.slice(7);
  }
  if (cleanLink.startsWith('www.')) {
    cleanLink = cleanLink.slice(4);
  }

  return cleanLink;
};

const checkIfExists = async (cik: string): Promise<boolean> => {
  const supabase = createClient();
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;

  if (!accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public-company-logos/${cik}/exists`,
    {
      method: 'HEAD',
      headers: {
        authorization: accessToken,
      },
    },
  );

  return response.ok;
};

const uploadDefaultFile = async (cik: string) => {
  const supabase = serviceClient();

  try {
    const emptyBlob = new Blob([''], { type: 'text/plain' });
    const fileName = `${cik}/exists`;
    const { error } = await supabase.storage
      .from('public-company-logos')
      .upload(fileName, emptyBlob, { contentType: 'text/plain' });

    if (error) {
      log.error('Failed to upload default file', { error, cik });
      throw new ServerError('Failed to upload default file');
    }

    log.info('Successfully uploaded default file', { cik });
  } catch (error) {
    log.error('Unexpected error uploading default file', { error, cik });
    throw new ServerError('Unexpected error uploading default file');
  }
};

const uploadPublicCompanyImg = async (
  src: string,
  cik: string,
  format: string,
  name: string,
  index: number,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = serviceClient();

  try {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();

    const fileName = `${cik}/${name}`;
    const { error } = await supabase.storage
      .from('public-company-logos')
      .upload(fileName, blob, { contentType: `image/${format}` });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    // console.error(`Error uploading image ${name}:`, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
};

export const downloadPublicCompanyImgs = async (tickerData: TickerData) => {
  try {
    const supabase = serviceClient();
    let orgId = tickerData.website;

    if (!orgId) {
      orgId = await fetch(
        `https://api.brandfetch.io/v2/search/${tickerData.company_name}`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization:
              'Bearer ' + process.env.NEXT_PUBLIC_BRANDFETCH_API_KEY,
          },
        },
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => data[0].domain)
        .catch((err) => {
          log.error('Error occurred', {
            error: err,
            fnName: 'fetching orgId from brandfetch',
            companyName: tickerData.company_name,
          });
          throw err;
        });

      if (orgId) {
        const { error } = await supabase
          .from('companies')
          .update({ website: orgId })
          .eq('id', tickerData.id);

        if (error) {
          log.error('Error updating company websites:', error);
          console.error('Error updating company websites:', error);
          throw error;
        }
      }

      if (!orgId) {
        throw new Error('orgId is missing');
      }
    }

    const exists = await checkIfExists(tickerData.cik);

    if (exists) {
      return;
    }

    // For some reason, cleanLink returns a promise
    const link = await cleanLink(orgId);

    const images = await fetch(`https://api.brandfetch.io/v2/brands/${link}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + process.env.BRANDFETCH_API_KEY,
      },
    })
      .then((res) => {
        if (!res.ok) {
          log.error('HTTP error!', {
            status: res.status,
            res: res.body,
            fnName: 'fetching brandfetch images',
            link: cleanLink(orgId),
          });
          console.log(res);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .catch((err: Error) => {
        log.error('Error occurred', {
          error: err,
          fnName: 'fetching brandfetch images',
          orgId,
          cleanedOrgId: cleanLink(orgId ?? ''),
        });
        throw new ServerError(
          "Error when fetching public company's logos: " + err.message,
        );
      });

    await uploadDefaultFile(tickerData.cik);

    const uploadPromises = images.logos.map(async (img: any, index: number) => {
      if (img.type === 'other') return;

      const format =
        img.formats.find((format: any) => format.format === 'png') ??
        img.formats[0];
      const result = await uploadPublicCompanyImg(
        format.src,
        tickerData.cik,
        format.format,
        `${img.theme}-${img.type}`,
        index,
      );

      if (!result.success) {
        log.error('Error occurred', {
          error: result.error,
          fnName: 'uploading public company images',
          tickerData,
          img,
        });
        console.error(`Failed to upload image: ${result.error}`);
      }
    });

    await Promise.all(uploadPromises);
  } catch (err) {
    log.error('Error occurred', {
      error: err,
      fnName: 'downloading public company images',
      tickerData,
    });
    throw new ServerError("Error when fetching public company's logos");
  }
};
