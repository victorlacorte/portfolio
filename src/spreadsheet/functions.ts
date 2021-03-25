import { statsFrom } from 'src/finance';
import type { Stats, Transaction } from 'src/types';

import Logger from '../utils/logging';
import { add, mul, sub } from '../utils/number';
import { expectedPositive } from '../utils/messages';
import { profitMessage, snapshotMessage } from './logging';

type ProfitReturn = {
  total: number;
  profit: number;
  taxDeduction: number;
  log: string;
};

export function profit(
  year: number,
  month: number,
  transactions: Transaction[],
): ProfitReturn {
  let total = 0;
  let profit = 0;
  let taxDeduction = 0;
  const logger = new Logger();

  function handleSell(t: Transaction, stats: Stats): void {
    if (!t.taxDeduction) {
      throw new Error(expectedPositive(t.taxDeduction));
    }

    if (t.date.year === year && t.date.month === month) {
      const currTotal = sub(mul(t.averagePrice, t.quantity), t.transactionTax);
      const purchasedValue = mul(stats[t.ticker].averagePrice, t.quantity);

      const currProfit = sub(currTotal, purchasedValue);

      total += currTotal;
      profit += currProfit;
      taxDeduction += t.taxDeduction;

      logger.add(
        profitMessage({
          date: t.date,
          ticker: t.ticker,
          quantity: t.quantity,
          purchasedValue,
          profit: currProfit,
          taxDeduction: t.taxDeduction,
          total: currTotal,
        }),
      );
    }
  }

  statsFrom({
    transactions,
    onSell: handleSell,
  });

  return { total, profit, taxDeduction, log: logger.join() };
}

export function snapshot(transactions: Transaction[]) {
  const control: { [ticker: string]: Logger } = {};

  function handleOperation(t: Transaction, stats: Stats): void {
    if (!Object.prototype.hasOwnProperty.call(control, t.ticker)) {
      control[t.ticker] = new Logger();
    }

    // TODO this is incorrect and should be calculated in the Portfolio
    const total = add(mul(t.averagePrice, t.quantity), t.taxDeduction);

    control[t.ticker].add(snapshotMessage({ ...t, total }));
  }

  const stats = statsFrom({
    startDate,
    endDate,
    transactions,
    onBuy: handleOperation,
    onSell: handleOperation,
  });

  return Object.keys(control).map((ticker) => {
    if (Object.prototype.hasOwnProperty.call(stats, ticker)) {
      return {
        ticker,
        purchasedQuantity: stats[ticker].purchased.qty,
        purchasedTotal: stats[ticker].purchased.total,
        soldQuantity: stats[ticker].sold.qty,
        soldTotal: stats[ticker].sold.total,
        averagePrice: stats[ticker].averagePrice,
        log: control[ticker].join(),
      };
    }

    return {
      ticker,
      purchasedQuantity: 'NA',
      purchasedTotal: 'NA',
      soldQuantity: 'NA',
      soldTotal: 'NA',
      averagePrice: 'NA',
      log: control[ticker].join(),
    };
  });
}
