import { Transaction } from '../finance';
import { SimpleDate } from '../utils/date';
import { operations } from '../constants';
import {
  diffLengthNR,
  expectedFinite,
  expectedReceived,
} from '../utils/messages';
import type {
  SimpleDate as _SimpleDate,
  NamedRange,
  Operation,
  SpreadsheetTransaction,
  Transaction as _Transaction,
} from '../types';

export function sameLength(...x: any[]): boolean {
  const length = x[0].length;

  return x.every((arr) => arr.length === length);
}

export function sanitizeSparseMatrix<T>(x: T[][]): T[] {
  return x.flat().filter((val) => val !== undefined && val.toString().length);
}

export function sanitizeNamedRange(range: NamedRange<unknown>): string[] {
  return sanitizeSparseMatrix(range).map((x) => x.toString());
}

/**
 * @param x date strings in the format yyyy/mm/dd
 * @returns SimpleDates
 */
export function sanitizeDates(x: string[]): _SimpleDate[] {
  return x.map((d, idx) => {
    const sanitized = d.replace(/\W/g, '');

    if (sanitized.length != 8) {
      throw new Error(expectedReceived('a yyyy/mm/dd date', d, idx + 1));
    }

    const year = Number(sanitized.slice(0, 4));
    const month = Number(sanitized.slice(4, 6));
    const day = Number(sanitized.slice(6, 8));

    return SimpleDate.make({ year, month, day });
  });
}

export function sanitizeOperations(x: string[]): Operation[] {
  return x.map((op, idx) => {
    const valid = op.toLowerCase() as Operation;

    if (!operations.includes(valid)) {
      throw new Error(expectedReceived(`[${operations}]`, op, idx + 1));
    }

    return valid;
  });
}

export function sanitizeNumbers(x: string[]): number[] {
  return x.map((n, idx) => {
    const valid = Number(n);

    if (!isFinite(valid)) {
      throw new Error(expectedFinite(valid, idx + 1));
    }

    return valid;
  });
}

export function makeTransactions(
  params: SpreadsheetTransaction,
): _Transaction[] {
  const date = sanitizeDates(sanitizeNamedRange(params.date));
  const ticker = sanitizeNamedRange(params.ticker);
  const operation = sanitizeOperations(sanitizeNamedRange(params.operation));
  const quantity = sanitizeNumbers(sanitizeNamedRange(params.quantity));
  const averagePrice = sanitizeNumbers(sanitizeNamedRange(params.averagePrice));
  const transactionTax = sanitizeNumbers(
    sanitizeNamedRange(params.transactionTax),
  );
  const taxDeduction = sanitizeNumbers(sanitizeNamedRange(params.taxDeduction));

  if (
    !sameLength(
      date,
      ticker,
      operation,
      quantity,
      averagePrice,
      transactionTax,
      taxDeduction,
    )
  ) {
    throw new Error(diffLengthNR);
  }

  return date.map(
    (d, idx) =>
      new Transaction({
        date: d,
        ticker: ticker[idx],
        operation: operation[idx],
        quantity: quantity[idx],
        averagePrice: averagePrice[idx],
        transactionTax: transactionTax[idx],
        taxDeduction: taxDeduction[idx],
      }),
  );
}
