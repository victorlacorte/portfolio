import * as R from 'ramda';
import { add, div, mul, sub, trunc } from '../utils/number';

type Base = (price: number, quantity: number, tax: number) => number;
type Profit = (
  ...params: [...base: Parameters<Base>, prevPrice: number]
) => number;

const truncate = (x: number): number => trunc(x, 4);

function _averagePrice(price: number, quantity: number, tax: number): number;
function _averagePrice(
  price: number,
  quantity: number,
  tax: number,
  prevPrice: number,
  prevQuantity: number,
): number;
function _averagePrice(
  price: number,
  quantity: number,
  tax: number,
  prevPrice?: number,
  prevQuantity?: number,
): number {
  const total = _buyTotal(price, quantity, tax);

  if (prevPrice === undefined && prevQuantity === undefined) {
    return div(total, quantity);
  }

  return div(
    add(mul(prevPrice, prevQuantity), total),
    add(prevQuantity, quantity),
  );
}

const _buyTotal: Base = (price, quantity, tax): number =>
  add(mul(price, quantity), tax);

const _sellTotal: Base = (price, quantity, tax): number =>
  sub(mul(price, quantity), tax);

const _profit: Profit = (price, quantity, tax, prevPrice) =>
  _sellTotal(sub(price, prevPrice), quantity, tax);

const _profitPercent: Profit = (price, quantity, tax, prevPrice) =>
  sub(div(_sellTotal(price, quantity, tax), mul(prevPrice, quantity)), 1);

export const averagePrice: typeof _averagePrice = R.pipe(
  _averagePrice,
  truncate,
);

export const buyTotal: typeof _buyTotal = R.pipe(_buyTotal, truncate);

export const sellTotal: typeof _sellTotal = R.pipe(_sellTotal, truncate);

export const profit: typeof _profit = R.pipe(_profit, truncate);

export const profitPercent: typeof _profitPercent = R.pipe(
  _profitPercent,
  truncate,
);

// TODO these functions are simple date utilities
// type CompareFn = (a: PositionEntry, b: PositionEntry) => number;
// const compareAscending: CompareFn = (a, b) =>
//   a.date.equals(b.date)
//     ? -1
//     : Number(a.date.toJSDate()) - Number(b.date.toJSDate());
// const compareDescending: CompareFn = (a, b) =>
//   b.date.equals(a.date)
//     ? 1
//     : Number(b.date.toJSDate()) - Number(a.date.toJSDate());
