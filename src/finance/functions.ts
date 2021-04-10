import { add, div, mul, sub } from '../utils/number';
import type { PortfolioEntry, Transaction } from '../types';

export function averagePrice(t: Transaction): number;

export function averagePrice(
  t: Transaction,
  p: Omit<PortfolioEntry, 'date'>,
): number;

export function averagePrice(
  t: Transaction,
  p?: Omit<PortfolioEntry, 'date'>,
): number {
  const tTotal = add(mul(t.quantity, t.price), t.tax);

  if (p === undefined) {
    return div(tTotal, t.quantity);
  }

  return div(
    add(mul(p.quantity, p.price), tTotal),
    add(p.quantity, t.quantity),
  );
}

export function sellTotal(t: Transaction): number {
  return sub(mul(t.quantity, t.price), t.tax);
}

export function profit(
  t: Transaction,
  p: Omit<PortfolioEntry, 'date'>,
): number {
  return sub(sellTotal(t), mul(p.quantity, p.price));
}

export function profitPercent(
  t: Transaction,
  p: Omit<PortfolioEntry, 'date'>,
): number {
  return sub(div(sellTotal(t), mul(p.quantity, p.price)), 1);
}
