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

    if (!Number.isFinite(valid)) {
      throw new Error(expectedFinite(valid, idx + 1));
    }

    return valid;
  });
}

export function makeTransactions(
  params: SpreadsheetTransaction,
): _Transaction[] {
  const dates = sanitizeDates(sanitizeNamedRange(params.date));
  const tickers = sanitizeNamedRange(params.ticker);
  const operations = sanitizeOperations(sanitizeNamedRange(params.operation));
  const quantities = sanitizeNumbers(sanitizeNamedRange(params.quantity));
  const averagePrices = sanitizeNumbers(
    sanitizeNamedRange(params.averagePrice),
  );
  const transactionTaxes = sanitizeNumbers(
    sanitizeNamedRange(params.transactionTax),
  );
  const taxDeductions = sanitizeNumbers(
    sanitizeNamedRange(params.taxDeduction),
  );

  if (
    !sameLength(
      dates,
      tickers,
      operations,
      quantities,
      averagePrices,
      transactionTaxes,
      taxDeductions,
    )
  ) {
    throw new Error(diffLengthNR);
  }

  return Array.from({ length: dates.length }, (_, i) =>
    Transaction.make({
      date: dates[i],
      ticker: tickers[i],
      operation: operations[i],
      quantity: quantities[i],
      averagePrice: averagePrices[i],
      transactionTax: transactionTaxes[i],
      taxDeduction: taxDeductions[i],
    }),
  );
}
