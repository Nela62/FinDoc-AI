export default function QuarterStockChart(): string {
  const data = [
    { date: '06-27', price: 170.48 },
    { date: '07-01', price: 176.57 },
    { date: '07-03', price: 173.75 },
    { date: '07-08', price: 175.43 },
    { date: '07-10', price: 173.86 },
    { date: '07-12', price: 181.11 },
    { date: '07-16', price: 183.79 },
    { date: '07-18', price: 185.11 },
    { date: '07-22', price: 181.69 },
    { date: '07-24', price: 187.36 },
    { date: '07-26', price: 187.04 },
  ];
  // const data = [
  //   { date: '2023-01-01', value: 100 },
  //   { date: '2023-02-01', value: 120 },
  //   { date: '2023-03-01', value: 110 },
  //   { date: '2023-04-01', value: 130 },
  //   { date: '2023-05-01', value: 150 },
  // ];

  return `
  const data = [
            {date: '06-27', price: 170.48},
            {date: '07-01', price: 176.57},
            {date: '07-03', price: 173.75},
            {date: '07-08', price: 175.43},
            {date: '07-10', price: 173.86},
            {date: '07-12', price: 181.11},
            {date: '07-16', price: 183.79},
            {date: '07-18', price: 185.11},
            {date: '07-22', price: 181.69},
            {date: '07-24', price: 187.36},
            {date: '07-26', price: 187.04}
        ];

  const margin = {top: 30, right: 30, bottom: 30, left: 60};
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const x = d3.scaleBand()
    .domain(data.map(d => d.date))
    .range([0, width])
    .padding(0.1);

  const minPrice = d3.min(data, d => d.price);
  const maxPrice = d3.max(data, d => d.price);
  const meanPrice = d3.mean(data, d => d.price);

  const y = d3.scaleLinear()
    .domain([minPrice * 0.99, maxPrice * 1.01])
    .range([height, 0]);

  const line = d3.line()
    .x(d => x(d.date) + x.bandwidth() / 2)
    .y(d => y(d.price));

  const area = d3.area()
    .x(d => x(d.date) + x.bandwidth() / 2)
    .y0(height)
    .y1(d => y(d.price));

  svg.append('path')
    .datum(data)
    .attr('fill', 'yellow')
    .attr('opacity', 0.3)
    .attr('d', area);

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .attr('d', line);

  svg.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x).tickSizeOuter(0));

  const yAxis = d3.axisLeft(y)
    .tickValues([minPrice, meanPrice, maxPrice])
    .tickFormat(d3.format(',.2f'));

  svg.append('g')
    .call(yAxis);

  const referenceLines = [170.48, 181.03];
  referenceLines.forEach(value => {
    svg.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', y(value))
      .attr('y2', y(value))
      .attr('stroke', 'gray')
      .attr('stroke-dasharray', '5,5');
  });

  svg.append('text')
    .attr('x', -margin.left + 10)
    .attr('y', -margin.top / 2)
    .attr('text-anchor', 'start')
    .style('font-size', '16px')
    .text('Price ($)');
    `;
}
