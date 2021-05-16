import * as R from 'ramda';
import { add, div, mul, sub, trunc } from '../utils/number';
import type { PositionEntry, Transaction } from '../types';

type Entry = Omit<PositionEntry, 'date'>;

const truncate = (x: number): number => trunc(x, 4);

function _averagePrice(t: Transaction): number;
function _averagePrice(t: Transaction, e: Entry): number;
function _averagePrice(t: Transaction, e?: Entry): number {
  const tTotal = buyTotal(t);

  if (e === undefined) {
    return div(tTotal, t.quantity);
  }

  return div(
    add(mul(e.quantity, e.price), tTotal),
    add(e.quantity, t.quantity),
  );
}

const _buyTotal = (t: Transaction): number =>
  add(mul(t.quantity, t.price), t.tax);

const _sellTotal = (t: Transaction): number =>
  sub(mul(Math.abs(t.quantity), t.price), t.tax);

const _profit = (t: Transaction, e: Entry): number =>
  sub(mul(sub(t.price, e.price), Math.abs(t.quantity)), t.tax);

function _profitPercent(t: Transaction, e: Entry): number {
  const soldQuantity = Math.abs(t.quantity);

  return sub(
    div(sub(mul(t.price, soldQuantity), t.tax), mul(e.price, soldQuantity)),
    1,
  );
}

export const averagePrice: typeof _averagePrice = R.pipe(
  _averagePrice,
  truncate,
);
// export const averagePrice = _averagePrice;

export const buyTotal: typeof _buyTotal = R.pipe(_buyTotal, truncate);

export const sellTotal: typeof _sellTotal = R.pipe(_sellTotal, truncate);

export const profit: typeof _profit = R.pipe(_profit, truncate);

export const profitPercent: typeof _profitPercent = R.pipe(
  _profitPercent,
  truncate,
);
