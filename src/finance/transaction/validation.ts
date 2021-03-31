import * as R from 'ramda';

import { expectedPositive } from 'src/utils/messages';
import type { Transaction } from 'src/types';

function validatePositive(x: number): void {
  if (x <= 0) throw new Error(expectedPositive(x));
}

// function validatePositiveOrZero(x: number): void {
//   if (x < 0) throw new Error(expectedPositiveOrZero(x));
// }

/**
 * `quantity` is a strictly positive _integer_
 */
function validateQuantity(t: Transaction): Transaction {
  const q = t.quantity;

  if (!Number.isInteger(q) || q <= 0) {
    throw new Error(`Invalid quantity for transaction ${t}`);
  }

  return t;
}

/**
 * `averagePrice` might be zero as a side effect to include `buy` operations
 * that represent dividends paid in stocks (i.e. an increase in the position
 * for no cost). The same principle applies to `total` and `transactionTax`.
 *
 * Currently, this scenario only makes sense when `operation` is `buy`.
 */
function validateAveragePrice(t: Transaction): Transaction {
  if (t.averagePrice) {
    validatePositive(t.averagePrice);
  } else if (t.operation !== 'buy') {
    throw new Error(`Average price required for ${t}`);
  }

  return t;
}

/**
 * The only scenario where `transactionTax` might be zero is described above,
 * in the `averagePrice` validation
 */
function validateTransactionTax(t: Transaction): Transaction {
  if (t.averagePrice) validatePositive(t.transactionTax);

  return t;
}

/**
 * `total` might be unset to indicate it has not yet been calculated.
 */
function validateTotal(t: Transaction): Transaction {
  if (t.total) validatePositive(t.total);

  return t;
}

function validateTaxDeduction(t: Transaction): Transaction {
  if (t.taxDeduction) {
    validatePositive(t.taxDeduction);
  } else if (t.operation !== 'buy') {
    throw new Error(`Tax deduction required for transaction ${t}`);
  }

  return t;
}

export const validateTransaction = R.pipe(
  validateQuantity,
  validateAveragePrice,
  validateTransactionTax,
  validateTotal,
  validateTaxDeduction,
);
