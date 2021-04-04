import { add, div, mul, sub } from '../utils/number';
import type { Transaction, PortfolioEntry } from '../types';

export function averagePrice(t: Transaction): number;

export function averagePrice(
  t: Transaction,
  p: Omit<PortfolioEntry, 'date'>,
): number;

export function averagePrice(
  t: Transaction,
  p?: Omit<PortfolioEntry, 'date'>,
): number {
  const tAvgPrice = div(add(mul(t.quantity, t.price), t.tax), t.quantity);

  if (p === undefined) {
    return tAvgPrice;
  }

  return div(
    add(mul(p.quantity, p.price), tAvgPrice),
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
