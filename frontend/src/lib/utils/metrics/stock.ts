import { DailyStockData, DailyStockDataPoint } from '@/types/alphaVantageApi';
import { eachDayOfInterval, format, sub } from 'date-fns';

export const getNWeeksStock = (
  dailyStock: DailyStockData,
  weeks: number = 52,
  start: Date = new Date(),
) => {
  const data = dailyStock['Time Series (Daily)'];
  const nWeeksAgo = sub(start, { weeks: weeks });
  const days = eachDayOfInterval({ start: nWeeksAgo, end: start });
  const stockData: DailyStockDataPoint[] = [];

  days.forEach((day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    if (data.hasOwnProperty(formattedDay)) {
      stockData.push({ day: formattedDay, data: data[formattedDay] });
    }
  });

  return stockData;
};

export const getNMonthsStock = (
  dailyStock: DailyStockData,
  months: number = 3,
  start: Date = new Date(),
) => {
  const data = dailyStock['Time Series (Daily)'];
  let currentDate = start;
  let endDate = sub(start, { months: months });
  const stockData: DailyStockDataPoint[] = [];

  while (stockData.length < months * 22 && currentDate >= endDate) {
    const formattedDay = format(currentDate, 'yyyy-MM-dd');
    if (data.hasOwnProperty(formattedDay)) {
      stockData.push({ day: formattedDay, data: data[formattedDay] });
    }
    currentDate = sub(currentDate, { days: 1 });
  }

  return stockData;
};

export const getNYearsStock = (
  dailyStock: DailyStockData,
  years: number = 1,
  start: Date = new Date(),
) => {
  const data = dailyStock['Time Series (Daily)'];
  const nYearsAgo = sub(start, { years: years });

  const days = eachDayOfInterval({ start: nYearsAgo, end: start });
  const stockData: DailyStockDataPoint[] = [];

  days.forEach((day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    if (data.hasOwnProperty(formattedDay)) {
      stockData.push({ day: formattedDay, data: data[formattedDay] });
    }
  });

  return stockData;
};

export const getYearsStock = (dailyStock: DailyStockData, year: number) => {
  const data = dailyStock['Time Series (Daily)'];
  const days = eachDayOfInterval({
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31),
  });

  const stockData: DailyStockDataPoint[] = [];

  days.forEach((day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    if (data.hasOwnProperty(formattedDay)) {
      stockData.push({ day: formattedDay, data: data[formattedDay] });
    }
  });

  return stockData;
};

export const getLatestStockDataPoint = (stockData: DailyStockDataPoint[]) =>
  stockData[stockData.length - 1];

export const getHighestStockPrice = (stockData: DailyStockDataPoint[]) => {
  if (stockData.length === 0) return null;
  return Number(
    Math.max(
      ...stockData.map((value) => Number(value.data['5. adjusted close'])),
    ).toFixed(2),
  );
};

export const getLowestStockPrice = (stockData: DailyStockDataPoint[]) => {
  if (stockData.length === 0) return null;
  return Number(
    Math.min(
      ...stockData.map((value) => Number(value.data['5. adjusted close'])),
    ).toFixed(2),
  );
};

export const getMeanClosingStockPrice = (stockData: DailyStockDataPoint[]) => {
  const sum = stockData.reduce(
    (acc, cur) => acc + Number(cur.data['5. adjusted close']),
    0,
  );
  return (sum / stockData.length).toFixed(2);
};

export const getAverageDailyVolume = (stockData: DailyStockDataPoint[]) => {
  // For 20 trading days
  const volumeValues = stockData.map((value) =>
    Number(value.data['6. volume']),
  );
  const sum = volumeValues.slice(0, 20).reduce((acc, cur) => acc + cur, 0);
  return sum / 20;
};
