import { div, mul, sub } from 'src/utils/number';
import type { SimpleDate, BuySellEvent, Stats, Transaction } from 'src/types';

import Portfolio from './portfolio';

type StatsFrom = {
  transactions: Transaction[];
  onBuy?: BuySellEvent;
  onSell?: BuySellEvent;
};

export function statsFrom({ transactions, onBuy, onSell }: StatsFrom): Stats {
  const p = Portfolio.make({ onBuy, onSell });

  transactions
    .sort((t1, t2) => Number(t1.date.toJSDate()) - Number(t2.date.toJSDate()))
    .forEach((t) => {
      p.add(t);
    });

  return p.stats;
}

type FilterTransactions = {
  transactions: Transaction[];
  startDate?: SimpleDate;
  endDate?: SimpleDate;
};

// Inclusive interval
export function filterTransactions({
  transactions,
  startDate,
  endDate,
}: FilterTransactions): Transaction[] {
  let t = [...transactions];

  if (startDate) {
    const date = startDate.toJSDate();
    t = t.filter((x) => x.date.toJSDate() >= date);
  }

  if (endDate) {
    const date = endDate.toJSDate();
    t = t.filter((x) => x.date.toJSDate() <= date);
  }

  return t;
}
