'use server';

import { serviceClient } from '@/lib/supabase/service';

export async function fetchNewsContent(url: string) {
  const jsdom = require('jsdom');
  const { JSDOM } = jsdom;

  const supabase = serviceClient();

  const { data, error } = await supabase
    .from('news_cache')
    .select('*')
    .eq('url', url)
    .maybeSingle();

  if (data) {
    return data.content;
  }

  const content = await fetch(url)
    .then((response) => response.text())
    .then((html) => {
      const dom = new JSDOM(html);
      const paragraphs = dom.window.document.querySelectorAll('p');
      const articleContent = Array.from(paragraphs).map(
        (p: any) => p.textContent,
      );

      return articleContent.join();
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  await supabase.from('news_cache').insert({ url, content });

  return content;
}
