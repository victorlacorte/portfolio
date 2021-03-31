import { statsFrom } from 'src/finance';
import type { BuySellEvent, Transaction } from 'src/types';

import Logger from '../utils/logging';
import { mul, sub } from '../utils/number';
import { profitMessage, snapshotMessage } from './logging';

type ProfitReturn = {
  total: number;
  profit: number;
  taxDeduction: number;
  log: string;
};

// `total` and `profit` return properties should be changed
export function profit(
  year: number,
  month: number,
  transactions: Transaction[],
): ProfitReturn {
  let total = 0;
  let profit = 0;
  let taxDeduction = 0;
  const logger = new Logger();

  // `taxDeduction` is not part of the profit calculation
  const handleSell: BuySellEvent = (t, stats) => {
    if (!t.total) throw new Error(`Expected 'total' in ${t}`);

    if (t.date.year === year && t.date.month === month) {
      const purchasedValue = mul(stats[t.ticker].averagePrice, t.quantity);
      const currProfit = sub(t.total, purchasedValue);

      total += t.total;
      profit += currProfit;
      taxDeduction += t.taxDeduction;

      logger.add(
        profitMessage({
          ...t,
          purchasedValue,
          profit: currProfit,
          total: t.total,
        }),
      );
    }
  };

  statsFrom({
    transactions,
    onSell: handleSell,
  });

  return { total, profit, taxDeduction, log: logger.join() };
}

export function snapshot(transactions: Transaction[]) {
  const control: { [ticker: string]: Logger } = {};

  // TODO we could also calculate profit on the trade
  const handleOperation: BuySellEvent = (t) => {
    if (!Object.prototype.hasOwnProperty.call(control, t.ticker)) {
      control[t.ticker] = new Logger();
    }

    control[t.ticker].add(snapshotMessage({ ...t }));
  };

  const stats = statsFrom({
    transactions,
    onBuy: handleOperation,
    onSell: handleOperation,
  });

  return Object.keys(control).map((ticker) => {
    if (
      Object.prototype.hasOwnProperty.call(stats, ticker) &&
      stats[ticker].averagePrice
    ) {
      return {
        ticker,
        purchasedQuantity: stats[ticker].purchased.quantity,
        purchasedTotal: stats[ticker].purchased.total,
        soldQuantity: stats[ticker].sold.quantity,
        soldTotal: stats[ticker].sold.total,
        averagePrice: stats[ticker].averagePrice,
        log: control[ticker].join(),
      };
    }
  });
}
