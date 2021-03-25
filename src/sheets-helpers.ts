import { CalendarDate } from './utils/date';
import Logger from './utils/logging';
import {
  expectedFinite,
  expectedPositive,
  expectedReceived,
  diffLengthNR,
} from './utils/messages';
import { div, format, mul, sub, toCurrency, toFixed } from './utils/number';
import { operations } from './constants';
import { statsFrom, Transaction as FinanceTransaction } from './finance';
import type {
  CalendarDate as CalendarDateType,
  Logger as _Logger,
  Operation,
  Transaction as TransactionType,
  SpreadsheetFunction,
  SpreadsheetTransaction,
  Stats,
} from './types';

export function sanitizeSparseMatrix<T>(arr: T[][]): T[] {
  return arr.flat().filter((val) => val !== undefined && val.toString().length);
}

export function sameLength(...arrays: any[]): boolean {
  const length = arrays[0].length;

  return arrays.every((arr) => arr.length === length);
}

export function sanitizeDates(dates: Date[][]): CalendarDateType[] {
  return sanitizeSparseMatrix(dates).map((d) => CalendarDate.fromJSDate(d));
}

export function sanitizeTickers(tickers: string[][]): string[] {
  return sanitizeSparseMatrix(tickers).map((t, idx) => {
    if (typeof t !== 'string') {
      throw new Error(expectedReceived('a string', t, idx + 1));
    }
    return t;
  });
}

export function sanitizeOperations(x: string[][]): Operation[] {
  return sanitizeSparseMatrix(x).map((op, idx) => {
    const valid = op.toLowerCase() as Operation;

    if (!operations.includes(valid)) {
      throw new Error(expectedReceived(`[${operations}]`, op, idx + 1));
    }

    return valid;
  });
}

export function sanitizeNumbers(numbers: number[][]): number[] {
  return sanitizeSparseMatrix(numbers).map((n, idx) => {
    if (!isFinite(n)) {
      throw new Error(expectedFinite(n, idx + 1));
    }
    return n;
  });
}

/**
 *  Might require attention/refactoring: we return a Finance.Transaction instead of a Types.Transaction
 */
export function makeTransactions({
  dates,
  tickers,
  operations,
  quantities,
  totals,
  taxDeductions,
}: SpreadsheetTransaction): FinanceTransaction[] {
  const _dates = sanitizeDates(dates);
  const _tickers = sanitizeTickers(tickers);
  const _operations = sanitizeOperations(operations);
  const _quantities = sanitizeNumbers(quantities);
  const _totals = sanitizeNumbers(totals);

  if (!taxDeductions) {
    taxDeductions = Array.from({ length: _dates.length }).fill([
      0,
    ]) as number[][];
  }

  const _taxDeductions = sanitizeNumbers(taxDeductions);

  if (
    !sameLength(
      _dates,
      _tickers,
      _operations,
      _quantities,
      _totals,
      _taxDeductions,
    )
  ) {
    throw new Error(diffLengthNR);
  }

  return _dates.map(
    (d, idx) =>
      new FinanceTransaction({
        date: d,
        ticker: _tickers[idx],
        operation: _operations[idx],
        quantity: _quantities[idx],
        total: _totals[idx],
        taxDeduction: _taxDeductions[idx],
      }),
  );
}

type ProfitLogMsg = {
  purchasedValue: number;
  profit: number;
} & Omit<TransactionType, 'operation'>;

export function profitLogMsg({
  date,
  ticker,
  quantity,
  total,
  purchasedValue,
  profit,
  taxDeduction,
}: ProfitLogMsg): string {
  const parsedTicker = ticker.toUpperCase();
  const parsedQuantity = format(quantity);
  const parsedTotal = toCurrency(total);
  const parsedProfit = toCurrency(profit);
  const parsedTaxDeduction = toCurrency(taxDeduction);

  const profitPercent = toFixed(div(profit, purchasedValue) * 100, 2);

  return `${date}: [${parsedTicker}] quantity=${parsedQuantity}, total=${parsedTotal}, profit=${parsedProfit} (${profitPercent}%), tax=${parsedTaxDeduction}`;
}

/**
 * We don't need to include the ticker since it is the key of this kind of log messages
 */
export function snapshotLogMsg({
  date,
  operation,
  quantity,
  total,
}: Omit<TransactionType, 'ticker'>): string {
  const parsedOperation = operation.toUpperCase();
  const parsedTotal = toCurrency(total);
  const averagePrice = toCurrency(div(total, quantity));

  return `${date}: [${parsedOperation}] ${quantity} stocks for ${parsedTotal} (${averagePrice})`;
}

type ProfitReturn = {
  total: number;
  profit: number;
  taxDeduction: number;
  log: string;
};

// we need to provide only the month and year
export function profit({
  startDate,
  endDate,
  ...transactionParams
}: SpreadsheetFunction): ProfitReturn {
  const transactions = makeTransactions(transactionParams);

  let total = 0;
  let profit = 0;
  let taxDeduction = 0;
  const logger = new Logger();

  function handleSell(transaction: TransactionType, stats: Stats): void {
    if (!transaction.taxDeduction || transaction.taxDeduction <= 0) {
      throw new Error(expectedPositive(transaction.taxDeduction));
    }

    if (
      transaction.date.year === endDate.year &&
      transaction.date.month === endDate.month
    ) {
      const purchasedValue = mul(
        transaction.quantity,
        stats[transaction.ticker].averagePrice,
      );

      const currProfit = sub(transaction.total, purchasedValue);

      total += transaction.total;
      profit += currProfit;
      taxDeduction += transaction.taxDeduction;

      logger.add(
        profitLogMsg({
          date: transaction.date,
          ticker: transaction.ticker,
          quantity: transaction.quantity,
          purchasedValue,
          profit: currProfit,
          taxDeduction: transaction.taxDeduction,
          total: transaction.total,
        }),
      );
    }
  }

  statsFrom({
    startDate,
    endDate,
    transactions,
    onSell: handleSell,
  });

  return { total, profit, taxDeduction, log: logger.join() };
}

type SnapshotReturn = {
  ticker: string;
  purchasedQuantity: number | 'NA';
  purchasedTotal: number | 'NA';
  soldQuantity: number | 'NA';
  soldTotal: number | 'NA';
  averagePrice: number | 'NA';
  log: string;
};

/**
 * TODO we could list the actual values rather than return "NA" but it would modify
 * the Finance.statsFrom function i.e. we need to delete closed position
 * tickers but they still need to be logged for improved visibility. As of now,
 * we simply delete them, and utilize the BuySellEvents to record
 * transaction information
 */
export function snapshot({
  startDate,
  endDate,
  ...transactionParams
}: SpreadsheetFunction): SnapshotReturn[] {
  const transactions = makeTransactions(transactionParams);

  const control: { [ticker: string]: Logger } = {};

  function handleOperation(transaction: TransactionType): void {
    if (!Object.prototype.hasOwnProperty.call(control, transaction.ticker)) {
      control[transaction.ticker] = new Logger();
    }

    control[transaction.ticker].add(snapshotLogMsg(transaction));
  }

  const stats = statsFrom({
    startDate,
    endDate,
    transactions,
    onBuy: handleOperation,
    onSell: handleOperation,
  });

  return Object.keys(control).map((ticker) => {
    if (Object.prototype.hasOwnProperty.call(stats, ticker)) {
      return {
        ticker,
        purchasedQuantity: stats[ticker].purchased.qty,
        purchasedTotal: stats[ticker].purchased.total,
        soldQuantity: stats[ticker].sold.qty,
        soldTotal: stats[ticker].sold.total,
        averagePrice: stats[ticker].averagePrice,
        log: control[ticker].join(),
      };
    }

    return {
      ticker,
      purchasedQuantity: 'NA',
      purchasedTotal: 'NA',
      soldQuantity: 'NA',
      soldTotal: 'NA',
      averagePrice: 'NA',
      log: control[ticker].join(),
    };
  });
}

type IrpfInput = { baseYear: number } & SpreadsheetTransaction;
type IrpfOutput = {
  ticker: string;
  ownedValuePrevYear: number;
  ownedValueCurrYear: number;
  log: _Logger;
};
export function irpfHelper({ baseYear, ...transactionParams }: IrpfInput) {
  /**
   * What should be in the returned array?
   *
   * ---------------------------------------------------
   * |Ticker|OwnedValuePrevYear|OwnedValueCurrYear|Log|
   * ---------------------------------------------------
   *
   * Ticker: stock ticker. Could be further utilized to obtain the company's CNPJ and a better asset description*
   * OwnedValueYearPrior: sold total - purchased total from the year prior to the one provided as argument
   * OwnedValueCurrYear: sold total - purchased total from `year`
   * Log: buy and sell transactions need to be discriminated for stocks whose owned value in the current year is zero
   *
   * We also need a way to tell "dirty" tickers from "clean" ones: we are interested in the dirty, obviously
   */
  const transactions = makeTransactions(transactionParams);
  const control: { [ticker: string]: Omit<IrpfOutput, 'ticker'> } = {};

  // function handleOperation(transaction: TransactionType): void {
  //   if (!Object.prototype.hasOwnProperty.call(control, transaction.ticker)) {
  //     control[transaction.ticker] = new LoggingUtils.Logger();
  //   }

  //   control[transaction.ticker].add(snapshotLogMsg(transaction));
  // }

  // TODO naive attempt: taxDeductions not considered
  function handleOperation(purchase: TransactionType, stats: Stats): void {
    const { ticker, date, quantity, total } = purchase;

    if (!Object.prototype.hasOwnProperty.call(control, ticker)) {
      control[ticker] = {
        log: new Logger(),
        ownedValuePrevYear: 0,
        ownedValueCurrYear: 0,
      };
    }

    control[ticker].log.add(snapshotLogMsg(purchase));

    const ownedValue = sub(
      stats[ticker].purchased.total,
      stats[ticker].sold.total,
    );

    if (date.year < baseYear) {
      control[ticker].ownedValuePrevYear = ownedValue;
      control[ticker].ownedValueCurrYear = ownedValue;
    } else if (date.year == baseYear) {
      control[ticker].ownedValueCurrYear = ownedValue;
    }
  }

  statsFrom({
    startDate: new CalendarDate(1900, 1, 1),
    endDate: new CalendarDate(baseYear, 12, 31),
    transactions,
    onBuy: handleOperation,
    onSell: handleOperation,
  });

  return control;

  // return Object.entries(
  //   control,
  // ).map(([key, { log, ownedValueCurrYear, ownedValuePrevYear }]) => [
  //   key,
  //   ownedValuePrevYear,
  //   ownedValueCurrYear,
  //   log,
  // ]);
}
