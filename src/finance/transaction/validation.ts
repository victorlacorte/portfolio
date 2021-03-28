import * as R from 'ramda';

import { expectedPositive, expectedPositiveOrZero } from 'src/utils/messages';
import type { Transaction } from 'src/types';

/**
 * `quantity` is a strictly positive _integer_ i.e. not float
 *
 * TODO `expectedPositive` is a poor message when the amount is a float
 */
export function validateQuantity(t: Transaction): Transaction {
  const q = t.quantity;

  if (!Number.isInteger(q) || q <= 0) throw new Error(expectedPositive(q));

  return t;
}

export function validatePositive(x: number): void {
  if (x <= 0) throw new Error(expectedPositive(x));
}

export function validateTransactionTax(t: Transaction): Transaction {
  validatePositive(t.transactionTax);

  return t;
}

export function validateTotal(t: Transaction): Transaction {
  if (t.total) validatePositive(t.total);

  return t;
}

export function validateTaxDeduction(t: Transaction): Transaction {
  if (t.taxDeduction) validatePositive(t.taxDeduction);

  return t;
}

export function validatePositiveOrZero(x: number): void {
  if (x < 0) throw new Error(expectedPositiveOrZero(x));
}

/**
 * `averagePrice` might be zero as a side effect to include `buy` operations
 * that represent stock dividends (i.e. an increase in the position for no
 * cost),
 */
export function validateAveragePrice(t: Transaction): Transaction {
  validatePositiveOrZero(t.averagePrice);

  return t;
}

export const validateTransaction = R.pipe(
  validateQuantity,
  validateAveragePrice,
  validateTransactionTax,
  validateTotal,
  validateTaxDeduction,
);
