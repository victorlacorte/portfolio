import { CalendarDate } from './utils/date';
import * as LoggingUtils from './utils/logging';
import * as Messages from './utils/messages';
import * as NumberUtils from './utils/number';
import { operations } from './utils/constants';
import type {
  CalendarDate as CalendarDateType,
  Operation,
  Transaction as TransactionType,
  SpreadsheetFunction,
  SpreadsheetTransaction,
  Stats,
} from './utils/types';
import { statsFrom, Transaction as FinanceTransaction } from './finance';

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
      throw new Error(Messages.expectedReceived('a string', t, idx + 1));
    }
    return t;
  });
}

export function sanitizeOperations(x: string[][]): Operation[] {
  return sanitizeSparseMatrix(x).map((op, idx) => {
    const valid = op.toLowerCase() as Operation;

    if (!operations.includes(valid)) {
      throw new Error(
        Messages.expectedReceived(`[${operations}]`, op, idx + 1),
      );
    }

    return valid;
  });
}

export function sanitizeNumbers(numbers: number[][]): number[] {
  return sanitizeSparseMatrix(numbers).map((n, idx) => {
    if (!isFinite(n)) {
      throw new Error(Messages.expectedFinite(n, idx + 1));
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
    throw new Error(Messages.diffLengthNR);
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
  const parsedQuantity = NumberUtils.format(quantity);
  const parsedTotal = NumberUtils.toCurrency(total);
  const parsedProfit = NumberUtils.toCurrency(profit);
  const parsedTaxDeduction = NumberUtils.toCurrency(taxDeduction);

  const profitPercent = NumberUtils.toFixed(
    NumberUtils.div(profit, purchasedValue) * 100,
    2,
  );

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
  const parsedTotal = NumberUtils.toCurrency(total);
  const averagePrice = NumberUtils.toCurrency(NumberUtils.div(total, quantity));

  return `${date}: [${parsedOperation}] ${quantity} stocks for ${parsedTotal} (${averagePrice})`;
}

type ProfitReturn = {
  total: number;
  profit: number;
  taxDeduction: number;
  log: string;
};

export function profit({
  startDate,
  endDate,
  ...transactionParams
}: SpreadsheetFunction): ProfitReturn {
  const transactions = makeTransactions(transactionParams);

  let total = 0;
  let profit = 0;
  let taxDeduction = 0;
  const logger = new LoggingUtils.Logger();

  function handleSell(transaction: TransactionType, stats: Stats): void {
    if (!transaction.taxDeduction || transaction.taxDeduction <= 0) {
      throw new Error(Messages.expectedPostive(transaction.taxDeduction));
    }

    if (
      transaction.date.year === endDate.year &&
      transaction.date.month === endDate.month
    ) {
      const purchasedValue = NumberUtils.mul(
        transaction.quantity,
        stats[transaction.ticker].averagePrice,
      );

      const currProfit = NumberUtils.sub(transaction.total, purchasedValue);

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
 * we simply delete them, and utilize the OperationCallbacks to record
 * transaction information
 */
export function snapshot({
  startDate,
  endDate,
  ...transactionParams
}: SpreadsheetFunction): SnapshotReturn[] {
  const transactions = makeTransactions(transactionParams);

  const control: { [ticker: string]: LoggingUtils.Logger } = {};

  function handleOperation(transaction: TransactionType): void {
    if (!Object.prototype.hasOwnProperty.call(control, transaction.ticker)) {
      control[transaction.ticker] = new LoggingUtils.Logger();
    }

    control[transaction.ticker].add(snapshotLogMsg(transaction));
  }

  const stats = statsFrom({
    startDate,
    endDate,
    transactions,
    onPurchase: handleOperation,
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
