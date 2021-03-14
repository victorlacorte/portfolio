import { CalendarDate, daysIn } from './utils/date';
import { profit as _profit, snapshot as _snapshot } from './sheets-helpers';

export function profit(
  year: number,
  month: number,
  portfolioStartingYear: number,
  portfolioStartingMonth: number,
  portfolioStartingDay: number,
  dates: Date[][],
  tickers: string[][],
  operations: string[][],
  quantities: number[][],
  totals: number[][],
  taxDeductions: number[][],
): (string | number)[] {
  const startDate = new CalendarDate(
    portfolioStartingYear,
    portfolioStartingMonth,
    portfolioStartingDay,
  );
  const endDate = new CalendarDate(year, month, daysIn(year, month));

  const stats = _profit({
    startDate,
    endDate,
    dates,
    tickers,
    operations,
    quantities,
    totals,
    taxDeductions,
  });

  return [stats.total, stats.profit, stats.taxDeduction, stats.log];
}

export function snapshot(
  startingYear: number,
  startingMonth: number,
  startingDay: number,
  endingYear: number,
  endingMonth: number,
  endingDay: number,
  dates: Date[][],
  tickers: string[][],
  operations: string[][],
  quantities: number[][],
  totals: number[][],
): (string | number)[][] {
  const startDate = new CalendarDate(startingYear, startingMonth, startingDay);
  const endDate = new CalendarDate(endingYear, endingMonth, endingDay);

  const stats = _snapshot({
    startDate,
    endDate,
    dates,
    tickers,
    operations,
    quantities,
    totals,
  });

  return stats.map((entry) => [
    entry.ticker,
    entry.purchasedQuantity,
    entry.purchasedTotal,
    entry.soldQuantity,
    entry.soldTotal,
    entry.averagePrice,
    entry.log,
  ]);
}
