import * as R from 'ramda';
import { add, div, mul, sub, trunc } from '../utils/number';
import type { PositionEntryBase, Transaction } from '../types';

type PositionEntry = Omit<PositionEntryBase, 'date'>;

const truncate = (x: number): number => trunc(x, 4);

function _averagePrice(t: Transaction): number;
function _averagePrice(t: Transaction, e: PositionEntry): number;
function _averagePrice(t: Transaction, e?: PositionEntry): number {
  const tTotal = add(mul(t.quantity, t.price), t.tax);

  if (e === undefined) {
    return div(tTotal, t.quantity);
  }

  return div(
    add(mul(e.quantity, e.price), tTotal),
    add(e.quantity, t.quantity),
  );
}

const _sellTotal = (t: Transaction): number =>
  sub(mul(Math.abs(t.quantity), t.price), t.tax);

const _profit = (t: Transaction, e: PositionEntry): number =>
  sub(mul(sub(t.price, e.price), Math.abs(t.quantity)), t.tax);

function _profitPercent(t: Transaction, e: PositionEntry): number {
  const soldQuantity = Math.abs(t.quantity);

  return sub(
    div(sub(mul(t.price, soldQuantity), t.tax), mul(e.price, soldQuantity)),
    1,
  );
}

export const averagePrice = R.pipe(_averagePrice, truncate);
export const profit = R.pipe(_profit, truncate);
export const profitPercent = R.pipe(_profitPercent, truncate);
export const sellTotal = R.pipe(_sellTotal, truncate);
