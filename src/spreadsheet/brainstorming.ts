import type { Range } from './types';
/**
 * return [stats.total, stats.profit, stats.taxDeduction, stats.log];
 */
declare function profit(
  year: unknown,
  month: unknown,
  dates: Range,
  tickers: Range,
  quantities: Range,
  prices: Range,
  taxes: Range,
);

/**
  return stats.map((entry) => [
    entry.ticker,
    entry.purchasedQuantity,
    entry.purchasedTotal,
    entry.soldQuantity,
    entry.soldTotal,
    entry.averagePrice,
    entry.log,
  ]);
 */
declare function snapshot(
  dates: Range,
  tickers: Range,
  quantities: Range,
  prices: Range,
  taxes: Range,
);
