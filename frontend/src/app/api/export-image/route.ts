import puppeteer from 'puppeteer';
import { Chart } from '@/components/TopBar/export/components/Chart';

async function renderComponentAsImage(html: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const img = await page.screenshot({ path: 'component.png' });
  // await page.screenshot({ path: 'component.png' });
  await browser.close();
  return img;
}

export async function POST(req: Request) {
  const json = await req.json();
  const html = json.html;

  const imgBuffer = await renderComponentAsImage(html);
  return new Response(await new Blob(imgBuffer), {
    headers: { 'content-type': 'image/png' },
  });
}
