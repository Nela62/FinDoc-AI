import QuarterStockChart from './charts/QuarterStockChart';
import { NextRequest, NextResponse } from 'next/server';
import { DAILY_IBM } from '@/lib/data/daily_ibm';
import React from 'react';
import sharp from 'sharp';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  try {
    const props = {
      colors: ['#1c4587', '#f4e9d3', '#006f3b'],
      targetPrice: 168,
      dailyStock: DAILY_IBM,
    };

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const ReactDOMServer = (await import('react-dom/server')).default;

    // Render the React component to a string
    const chartHtml = ReactDOMServer.renderToString(
      <QuarterStockChart {...props} />,
      // React.createElement(QuarterStockChart, props),
    );

    // Create a full HTML page with the rendered component
    const fullHtml = `
      <html>
        <head>
          <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/recharts/umd/Recharts.js"></script>
        </head>
        <body>
          <div id="chart">${chartHtml}</div>
        </body>
      </html>
    `;

    await page.setContent(fullHtml);

    // Wait for the chart to render
    await page.waitForSelector('#chart');

    // Capture the screenshot
    const screenshot = await page.screenshot({ encoding: 'base64' });

    await browser.close();

    // Send the response
    return NextResponse.json({
      success: true,
      imageBase64: screenshot,
      type: 'image/png',
    });

    // const ReactDOMServer = (await import('react-dom/server')).default;
    // const QuarterStockChart = (await import('./charts/QuarterStockChart'))
    //   .default;
    // const component = <QuarterStockChart {...props} />;
    // const svg = Buffer.from(ReactDOMServer.renderToString(component));
    // const png = await sharp(svg)
    //   .flatten({ background: 'white' })
    //   .png()
    //   .toBuffer();

    // return new NextResponse(png, {
    //   status: 200,
    //   headers: { 'Content-Type': 'image/png' },
    // });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate chart' },
      { status: 500 },
    );
  }
}
