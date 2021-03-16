import type {
  CalendarDate,
  Transaction,
  OperationCallback,
  Stats,
} from 'src/types';

import Portfolio from './portfolio';

type StatsFrom = {
  startDate: CalendarDate;
  endDate: CalendarDate;
  transactions: Transaction[];
  onPurchase?: OperationCallback;
  onSell?: OperationCallback;
};

export function statsFrom({
  startDate,
  endDate,
  transactions,
  onPurchase,
  onSell,
}: StatsFrom): Stats {
  const start = startDate.toJSDate();
  const end = endDate.toJSDate();

  const p = new Portfolio({ onPurchase, onSell });

  transactions
    .filter((t) => t.date.toJSDate() >= start && t.date.toJSDate() <= end)
    .sort((t1, t2) => Number(t1.date.toJSDate()) - Number(t2.date.toJSDate()))
    .forEach((t) => {
      p.add(t);
    });

  return p.stats;
}
