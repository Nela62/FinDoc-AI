import { sub } from 'date-fns';
import Exa from 'exa-js';
import { Logger } from 'next-axiom';

const log = new Logger();

export async function fetchNews(companyName: string) {
  'use server';

  try {
    const exa = new Exa(process.env.EXA_API_KEY);

    // Get press releases from the past year using keyword search
    // const press = await exa
    //   .searchAndContents(companyName + 'press release', {
    //     type: 'keyword',
    //     numResults: 15,
    //     text: true,
    //     category: 'news',
    //     startPublishedDate: sub(new Date(), { years: 1 }).toISOString(),
    //     endPublishedDate: new Date().toISOString(),
    //   })
    //   .then((res) => res.results)
    //   .catch((error) => {
    //     log.error('Error occurred', {
    //       error,
    //       companyName,
    //       fnName: 'press',
    //     });
    //     return [];
    //   });

    const last3Months = await exa
      .searchAndContents(companyName + 'news', {
        type: 'neural',
        numResults: 25,
        text: true,
        category: 'news',
        useAutoprompt: true,
        startPublishedDate: sub(new Date(), { months: 3 }).toISOString(),
        endPublishedDate: new Date().toISOString(),
      })
      .then((res) => res.results)
      .catch((error) => {
        log.error('Error occurred', {
          error,
          companyName,
          fnName: 'last3Months',
        });
        return [];
      });

    return [...last3Months];

    // const last6Months = await exa
    //   .searchAndContents(companyName + 'news', {
    //     type: 'neural',
    //     numResults: 25,
    //     text: true,
    //     category: 'news',
    //     useAutoprompt: true,
    //     startPublishedDate: sub(new Date(), { months: 9 }).toISOString(),
    //     endPublishedDate: sub(new Date(), { months: 3 }).toISOString(),
    //   })
    //   .then((res) => res.results)
    //   .catch((error) => {
    //     log.error('Error occurred', {
    //       error,
    //       companyName,
    //       fnName: 'last6Months',
    //     });
    //     return [];
    //   });

    // const last9Months = await exa
    //   .searchAndContents(companyName + 'news', {
    //     type: 'neural',
    //     numResults: 25,
    //     text: true,
    //     category: 'news',
    //     useAutoprompt: true,
    //     startPublishedDate: sub(new Date(), { months: 18 }).toISOString(),
    //     endPublishedDate: sub(new Date(), { months: 9 }).toISOString(),
    //   })
    //   .then((res) => res.results)
    //   .catch((error) => {
    //     log.error('Error occurred', {
    //       error,
    //       companyName,
    //       fnName: 'last9Months',
    //     });
    //     return [];
    //   });
  } catch (err) {
    log.error('Error occurred', {
      error: err,
      fnName: 'fetchNews',
      companyName,
    });
    return [];
  }
}
