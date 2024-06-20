import { XMLParser } from 'fast-xml-parser';

export const get10KCompetitionSection = (xml: any) => {
  const parser = new XMLParser({ ignoreAttributes: false });

  const parsedXml = parser.parse(xml);
  const body = parsedXml.html.body;

  let competition = '';
  let start = false;
  let end = false;
  let style = { underline: true };

  const isBold = (text?: string) =>
    text?.includes('font-weight:700') || text?.includes('font-weight:bold');

  const isUnderlined = (text?: string) =>
    text?.includes('text-decoration:underline');

  const isItalic = (text?: string) => text?.includes('font-style:italic');

  const isUpperCase = (text?: string) =>
    text?.split('').every((c) => c === c.toUpperCase());

  const searchObject = (object: any) => {
    Object.entries(object).forEach(([key, value]: [string, any]) => {
      if (end) return;
      if (
        !start &&
        key === 'span' &&
        typeof value['#text'] === 'string' &&
        value['#text'].toLowerCase().includes('competition') &&
        isBold(value['@_style'])
      ) {
        start = true;
        console.log('competition!');
        competition += value['#text'] ? value['#text'] + '\n' : '';
        style = {
          underline: isUnderlined(value['@_style']) ?? false,
        };
      } else if (key === 'span') {
        if (start && !end) {
          if (Array.isArray(value)) {
            value.forEach((val) => {
              if (
                isBold(val['@_style']) &&
                style.underline === isUnderlined(val['@_style']) &&
                !isItalic(val['@_style']) &&
                !isUpperCase(val['#text'])
              ) {
                console.log('end!');
                end = true;
                return;
              } else {
                competition += val['#text'] ? val['#text'] + '\n' : '';
              }
            });
          } else {
            if (
              isBold(value['@_style']) &&
              style.underline === isUnderlined(value['@_style']) &&
              !isItalic(value['@_style']) &&
              !isUpperCase(value['#text'])
            ) {
              console.log('end!');
              end = true;
              return;
            } else {
              competition += value['#text'] ? value['#text'] + '\n' : '';
            }
          }
        }
      } else if (key === 'div' || key === 'p') {
        if (Array.isArray(value)) {
          value.forEach((item) => searchObject(item));
        } else if (typeof value === 'object') {
          searchObject(value);
        }
      }
    });
  };

  searchObject(body);

  return competition;
};

export const get10KMDASection = (xml: any) => {
  const parser = new XMLParser({ ignoreAttributes: false });

  const parsedXml = parser.parse(xml);
  const body = parsedXml.html.body;

  let text = '';
  let scrape = false;

  const isBold = (text?: string) =>
    text?.includes('font-weight:700') || text?.includes('font-weight:bold');

  const isUnderlined = (text?: string) =>
    text?.includes('text-decoration:underline');

  const searchObject = (object: any) => {
    Object.entries(object).forEach(([key, value]: [string, any]) => {
      try {
        if (
          !scrape &&
          key === 'span' &&
          typeof value['#text'] === 'string' &&
          value['#text']
            .toLowerCase()
            .replace('&#160;', ' ')
            .startsWith('item 7.')
        ) {
          scrape = true;
          console.log('mda!');
          text += value['#text'] ? value['#text'] + '\n' : '';
        } else if (key === 'span') {
          if (scrape) {
            if (Array.isArray(value)) {
              value.forEach((val) => {
                if (
                  // style.bold === isBold(val["@_style"]) &&
                  // style.underline === isUnderlined(val["@_style"]) &&
                  typeof val['#text'] === 'string' &&
                  val['#text']
                    ?.toLowerCase()
                    .replace('&#160;', ' ')
                    .startsWith('item 8.')
                ) {
                  console.log('end!');
                  scrape = false;
                  return;
                } else {
                  text += val['#text'] ? val['#text'] + '\n' : '';
                }
              });
            } else {
              if (
                // style.bold === isBold(value["@_style"]) &&
                // style.underline === isUnderlined(value["@_style"]) &&
                typeof value['#text'] === 'string' &&
                value['#text']
                  ?.toLowerCase()
                  .replace('&#160;', ' ')
                  .includes('item 8.')
              ) {
                console.log('end!');
                scrape = false;
                return;
              } else {
                text += value['#text'] ? value['#text'] + '\n' : '';
              }
            }
          } else {
            if (Array.isArray(value)) {
              value.forEach((item) => {
                if (
                  typeof item['#text'] === 'string' &&
                  item['#text']
                    ?.toLowerCase()
                    .replace('&#160;', ' ')
                    .startsWith('item 7.')
                ) {
                  scrape = true;
                  console.log('mda!');
                  text += item['#text'] ? item['#text'] + '\n' : '';
                }
              });
            } else if (typeof value === 'object') {
              if (
                typeof value['#text'] === 'string' &&
                value['#text']
                  ?.toLowerCase()
                  .replace('&#160;', ' ')
                  .startsWith('item 7.')
              ) {
                scrape = true;
                console.log('mda!');
                text += value['#text'] ? value['#text'] + '\n' : '';
              }
            }
          }
        } else {
          if (Array.isArray(value)) {
            value.forEach((item) => searchObject(item));
          } else if (typeof value === 'object') {
            searchObject(value);
          }
        }
      } catch (err) {
        console.log(err);
        console.log(value);
      }
    });
  };

  searchObject(body);

  return text;
};

// TODO: could potentially capture all snippets that are bold and include competition
export const getS1CompetitionSection = (xml: any) => {
  const parser = new XMLParser({ ignoreAttributes: false });

  const parsedXml = parser.parse(xml);
  const body = parsedXml.html.body;

  let competition = '';
  let scrape = false;
  let style = { underline: true, italic: true };

  const isBold = (text?: string) =>
    text?.includes('font-weight:700') || text?.includes('font-weight:bold');

  const isUnderlined = (text?: string) =>
    text?.includes('text-decoration:underline');

  const isItalic = (text?: string) => text?.includes('font-style:italic');

  const isUpperCase = (text?: string) =>
    text?.split('').every((c) => c === c.toUpperCase());

  const searchObject = (object: any) => {
    Object.entries(object).forEach(([key, value]: [string, any]) => {
      if (
        !scrape &&
        key === 'span' &&
        typeof value['#text'] === 'string' &&
        (value['#text'].toLowerCase().includes('competition') ||
          value['#text'].toLowerCase().includes('competitors')) &&
        isBold(value['@_style'])
      ) {
        scrape = true;
        console.log('competition!');
        competition += value['#text'] ? value['#text'] + '\n' : '';
        style = {
          underline: isUnderlined(value['@_style']) ?? false,
          italic: isItalic(value['@_style']) ?? false,
        };
      } else if (key === 'span') {
        if (scrape) {
          if (Array.isArray(value)) {
            value.forEach((val) => {
              if (
                isBold(val['@_style']) &&
                style.underline === isUnderlined(val['@_style']) &&
                style.italic === isItalic(val['@_style']) &&
                !isUpperCase(val['#text'])
              ) {
                console.log('end!');
                scrape = false;
                return;
              } else {
                competition += val['#text'] ? val['#text'] + '\n' : '';
              }
            });
          } else {
            if (
              isBold(value['@_style']) &&
              style.underline === isUnderlined(value['@_style']) &&
              style.italic === isItalic(value['@_style']) &&
              !isUpperCase(value['#text'])
            ) {
              console.log('end!');
              scrape = false;
              return;
            } else {
              competition += value['#text'] ? value['#text'] + '\n' : '';
            }
          }
        }
      } else if (key === 'div' || key === 'p') {
        if (Array.isArray(value)) {
          value.forEach((item) => searchObject(item));
        } else if (typeof value === 'object') {
          searchObject(value);
        }
      }
    });
  };

  searchObject(body);

  return competition;
};
