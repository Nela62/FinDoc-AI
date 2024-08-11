import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

import SimpleChart from './components/Simple';
import QuarterStockChart from './components/QuarterStockChart';

export async function POST(req: NextRequest) {
  try {
    // const props = {
    //   colors: ['#1c4587', '#f4e9d3', '#006f3b'],
    //   targetPrice: 168,
    //   dailyStock: DAILY_IBM,
    // };
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const ReactDOMServer = (await import('react-dom/server')).default;
    // Render the React component to a string
    // const chartHtml = ReactDOMServer.renderToString(
    //   <SimpleChart />,
    //   // React.createElement(QuarterStockChart, props),
    // );
    // // Create a full HTML page with the rendered component
    // const fullHtml = `
    //   <html>
    //     <head>
    //      <script src="https://d3js.org/d3.v7.min.js"></script>
    //     </head>
    //     <body>
    //       <div id="chart">${chartHtml}</div>
    //     </body>
    //   </html>
    // `;
    // const chartScript = `
    //   const data = [
    //     {date: '2023-01-01', value: 100},
    //     {date: '2023-02-01', value: 120},
    //     {date: '2023-03-01', value: 110},
    //     {date: '2023-04-01', value: 130},
    //     {date: '2023-05-01', value: 150},
    //   ];

    //   const margin = {top: 20, right: 20, bottom: 30, left: 50};
    //   const width = 600 - margin.left - margin.right;
    //   const height = 400 - margin.top - margin.bottom;

    //   const svg = d3.select('#chart')
    //     .append('svg')
    //     .attr('width', width + margin.left + margin.right)
    //     .attr('height', height + margin.top + margin.bottom)
    //     .append('g')
    //     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    //   const x = d3.scaleTime()
    //     .domain(d3.extent(data, d => new Date(d.date)))
    //     .range([0, width]);

    //   const y = d3.scaleLinear()
    //     .domain([0, d3.max(data, d => d.value)])
    //     .range([height, 0]);

    //   const line = d3.line()
    //     .x(d => x(new Date(d.date)))
    //     .y(d => y(d.value));

    //   svg.append('path')
    //     .datum(data)
    //     .attr('fill', 'none')
    //     .attr('stroke', 'steelblue')
    //     .attr('stroke-width', 1.5)
    //     .attr('d', line);

    //   svg.append('g')
    //     .attr('transform', 'translate(0,' + height + ')')
    //     .call(d3.axisBottom(x));

    //   svg.append('g')
    //     .call(d3.axisLeft(y));
    // `;

    const chartScript = QuarterStockChart();
    // Create a full HTML page with the D3.js chart
    const fullHtml = `
      <html>
        <head>
          <script src="https://d3js.org/d3.v7.min.js"></script>
        </head>
        <body>
          <div id="chart"></div>
          <script>${chartScript}</script>
        </body>
      </html>
    `;

    await page.setContent(fullHtml);
    // Wait for the chart to render
    await page.waitForSelector('#chart');

    // const svgContent = await page.evaluate(() => {
    //   const svgElement = document.querySelector('#chart svg');
    //   return svgElement ? svgElement.outerHTML : null;
    // });
    // Capture the screenshot
    const screenshot = await page.screenshot({ encoding: 'base64' });
    await browser.close();

    // if (!svgContent) {
    //   throw new Error('Failed to generate SVG');
    // }

    // return new NextResponse(svgContent, {
    //   status: 200,
    //   headers: { 'Content-Type': 'image/svg+xml' },
    // });

    const dataUrl = `data:image/png;base64,${screenshot}`;

    // Send the response with the data URL
    return new NextResponse(dataUrl, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });

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
