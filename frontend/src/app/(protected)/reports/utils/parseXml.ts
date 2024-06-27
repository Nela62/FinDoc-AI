import { XMLParser } from 'fast-xml-parser';

const isBold = (text?: string) =>
  text?.includes('font-weight:700') || text?.includes('font-weight:bold');

const isUnderlined = (text?: string) =>
  text?.includes('text-decoration:underline');

const isItalic = (text?: string) => text?.includes('font-style:italic');

const isUpperCase = (text?: string) =>
  text?.split('').every((c) => c === c.toUpperCase());

export const get10KSection = (xml: string, section: string) => {
  const parser = new XMLParser({ ignoreAttributes: false });

  const parsedXml = parser.parse(xml);
  const body = parsedXml.html.body;

  let text = '';
  let start = false;
  let end = false;
  let style = { underline: true };

  const searchObject = (object: any) => {
    Object.entries(object).forEach(([key, value]: [string, any]) => {
      if (end) return;
      if (
        !start &&
        key === 'span' &&
        typeof value['#text'] === 'string' &&
        value['#text'].toLowerCase().includes(section) &&
        isBold(value['@_style'])
      ) {
        start = true;
        text += value['#text'] ? value['#text'] + '\n' : '';
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
                end = true;
                return;
              } else {
                text += val['#text'] ? val['#text'] + '\n' : '';
              }
            });
          } else {
            if (
              isBold(value['@_style']) &&
              style.underline === isUnderlined(value['@_style']) &&
              !isItalic(value['@_style']) &&
              !isUpperCase(value['#text'])
            ) {
              end = true;
              return;
            } else {
              text += value['#text'] ? value['#text'] + '\n' : '';
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

  return text.length > 40000 ? text.slice(0, 40000) : text;
};

export const get10KItem = (
  xml: any,
  itemNum: string,
  endSectionNum?: string,
) => {
  const parser = new XMLParser({ ignoreAttributes: false });

  const parsedXml = parser.parse(xml);
  const body = parsedXml.html.body;

  let text = '';
  let scrape = false;

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
            .startsWith(`item ${itemNum}.`)
        ) {
          scrape = true;
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
                    .startsWith(`item ${endSectionNum ?? itemNum + 1}.`)
                ) {
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
                  .includes(`item ${endSectionNum ?? itemNum + 1}.`)
              ) {
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
                    .startsWith(`item ${itemNum}.`)
                ) {
                  scrape = true;
                  text += item['#text'] ? item['#text'] + '\n' : '';
                }
              });
            } else if (typeof value === 'object') {
              if (
                typeof value['#text'] === 'string' &&
                value['#text']
                  ?.toLowerCase()
                  .replace('&#160;', ' ')
                  .startsWith(`item ${itemNum}.`)
              ) {
                scrape = true;
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

  return text.length > 40000 ? text.slice(0, 40000) : text;
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
