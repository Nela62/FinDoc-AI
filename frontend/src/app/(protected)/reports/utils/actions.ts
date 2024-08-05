'use server';

import Exa from 'exa-js';

import { serviceClient } from '@/lib/supabase/service';
import {
  fetchDailyStock,
  fetchOverview,
  fetchWeeklyStock,
} from '@/lib/utils/metrics/financialAPI';
import { MetricsData } from '@/types/metrics';
import { Logger } from 'next-axiom';
import { createClient } from '@/lib/supabase/server';
import { sub } from 'date-fns';

const log = new Logger();

export const cleanLink = (link: string) => {
  let cleanLink = link;

  if (cleanLink.startsWith('http://')) {
    cleanLink = cleanLink.slice(7);
  }
  if (cleanLink.startsWith('www.')) {
    cleanLink = cleanLink.slice(4);
  }

  return cleanLink;
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
    console.error(`Error uploading image ${name}:`, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
};

export const downloadPublicCompanyImgs = async (
  cik: string,
  tickers: {
    id: string;
    cik: string;
    company_name: string;
    stock_name: string;
    label: string;
    ticker: string;
    website: string | null;
  }[],
  orgId: string | null,
): Promise<{ success: boolean; error?: string }> => {
  'use server';

  try {
    const supabase = serviceClient();

    if (!orgId) {
      orgId = await fetch(
        `https://api.brandfetch.io/v2/search/${tickers[0].company_name}`,
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
            companyName: tickers[0].company_name,
          });
          throw err;
        });

      if (orgId) {
        const newTickers = tickers.map((ticker) => ({
          id: ticker.id,
          website: orgId,
        }));

        const { error } = await supabase.from('companies').update(newTickers);

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

    const images = await fetch(
      `https://api.brandfetch.io/v2/brands/${cleanLink(orgId)}`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_BRANDFETCH_API_KEY,
        },
      },
    )
      .then((res) => res.json())
      .catch((err: Error) => {
        log.error('Error occurred', {
          error: err,
          fnName: 'fetching brandfetch images',
          orgId,
          cleanedOrgId: cleanLink(orgId ?? ''),
        });
        throw new Error(
          "Error when fetching public company's logos: " + err.message,
        );
      });

    const uploadPromises = images.logos.map(async (img: any, index: number) => {
      if (img.type === 'other') return;

      const format =
        img.formats.find((format: any) => format.format === 'png') ??
        img.formats[0];
      const result = await uploadPublicCompanyImg(
        format.src,
        cik,
        format.format,
        `${img.theme}-${img.type}`,
        index,
      );

      if (!result.success) {
        log.error('Error occurred', {
          error: result.error,
          fnName: 'uploading public company images',
          cik,
          img,
        });
        console.error(`Failed to upload image: ${result.error}`);
      }
    });

    await Promise.all(uploadPromises);

    return { success: true };
  } catch (err) {
    log.error('Error occurred', {
      error: err,
      fnName: 'downloading public company images',
      cik,
      tickers,
    });
    if (err instanceof Error)
      throw new Error(
        "Error when fetching public company's logos: " + err.message,
      );
    return { success: false };
  }
};
