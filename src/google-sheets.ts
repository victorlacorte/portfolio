import { DateUtils } from 'src/utils/date';
import { LoggingUtils } from 'src/utils/logging';
import { Messages } from 'src/utils/messages';
import { NumberUtils } from 'src/utils/number';
import { Types } from 'src/utils/types';

import { Finance } from './finance';

export namespace GoogleSheets {
  export function sanitizeSparseMatrix<T>(arr: T[][]): T[] {
    return arr.flat().filter((val) => val !== undefined && val.toString().length);
  }

  export function sameLength(...arrays: any[]): boolean {
    const length = arrays[0].length;

    return arrays.every((arr) => arr.length === length);
  }

  export function sanitizeDates(dates: Date[][]): Types.CalendarDate[] {
    return sanitizeSparseMatrix(dates).map((d) => DateUtils.CalendarDate.fromJSDate(d));
  }

  export function sanitizeTickers(tickers: string[][]): string[] {
    return sanitizeSparseMatrix(tickers).map((t, idx) => {
      if (typeof t !== 'string') {
        throw new Error(Messages.expectedReceived('a string', t, idx + 1));
      }
      return t;
    });
  }

  export function sanitizeOperations(operations: string[][]): Types.Operation[] {
    const valid = Object.values(Types.Operation);
    return sanitizeSparseMatrix(operations).map((op, idx) => {
      if (!valid.some((v) => v === op.toLowerCase())) {
        throw new Error(Messages.expectedReceived(`[${valid}]`, op, idx + 1));
      }
      return op.toLowerCase() as Types.Operation;
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
  }: Types.SpreadsheetTransaction): Finance.Transaction[] {
    const _dates = sanitizeDates(dates);
    const _tickers = sanitizeTickers(tickers);
    const _operations = sanitizeOperations(operations);
    const _quantities = sanitizeNumbers(quantities);
    const _totals = sanitizeNumbers(totals);

    if (!taxDeductions) {
      taxDeductions = Array.from({ length: _dates.length }).fill([0]) as number[][];
    }

    const _taxDeductions = sanitizeNumbers(taxDeductions);

    if (!sameLength(_dates, _tickers, _operations, _quantities, _totals, _taxDeductions)) {
      throw new Error(Messages.diffLengthNR);
    }

    return _dates.map(
      (d, idx) =>
        new Finance.Transaction({
          date: d,
          ticker: _tickers[idx],
          operation: _operations[idx],
          quantity: _quantities[idx],
          total: _totals[idx],
          taxDeduction: _taxDeductions[idx],
        }),
    );
  }

  export function profitLogMsg({
    date,
    ticker,
    quantity,
    total,
    profit,
    taxDeduction,
  }: Omit<Types.Transaction, 'operation'> & { profit: number }): string {
    const parsedTicker = ticker.toUpperCase();
    const parsedQuantity = NumberUtils.format(quantity);
    const parsedTotal = NumberUtils.toCurrency(total);
    const parsedProfit = NumberUtils.toCurrency(profit);
    const parsedTaxDeduction = NumberUtils.toCurrency(taxDeduction);
    const profitPercent = NumberUtils.toFixed((profit / total) * 100, 2);

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
  }: Omit<Types.Transaction, 'ticker'>): string {
    const parsedOperation = operation.toUpperCase();
    const parsedTotal = NumberUtils.toCurrency(total);
    const averagePrice = NumberUtils.toCurrency(NumberUtils.div(total, quantity));

    return `${date}: [${parsedOperation}] ${quantity} stocks for ${parsedTotal} (${averagePrice})`;
  }

  type ProfitReturn = { total: number; profit: number; taxDeduction: number; log: string };

  export function profit({
    startDate,
    endDate,
    ...transactionParams
  }: Types.SpreadsheetFunction): ProfitReturn {
    const transactions = makeTransactions(transactionParams);

    let total = 0;
    let profit = 0;
    let taxDeduction = 0;
    const logger = new LoggingUtils.Logger();

    function handleSell(transaction: Types.Transaction, stats: Types.Stats): void {
      if (!transaction.taxDeduction || transaction.taxDeduction <= 0) {
        throw new Error(Messages.expectedPostive(transaction.taxDeduction));
      }

      if (transaction.date.year === endDate.year && transaction.date.month === endDate.month) {
        const currProfit = NumberUtils.sub(
          transaction.total,
          NumberUtils.mul(transaction.quantity, stats[transaction.ticker].averagePrice),
        );

        total += transaction.total;
        profit += currProfit;
        taxDeduction += transaction.taxDeduction;

        logger.entries = profitLogMsg({
          date: transaction.date,
          ticker: transaction.ticker,
          quantity: transaction.quantity,
          profit: currProfit,
          taxDeduction: transaction.taxDeduction,
          total: transaction.total,
        });
      }
    }

    Finance.statsFrom({
      startDate,
      endDate,
      transactions,
      onSell: handleSell,
    });

    return { total, profit, taxDeduction, log: logger.entries };
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
   * TODO we could list the actual values rather than "NA" but it would modify
   * the Finance.statsFrom function i.e. we need to delete closed position
   * tickers but they still need to be logged for improved visibility. As of now,
   * we simply delete them, and utilize the OperationCallbacks to record
   * transaction information
   */
  export function snapshot({
    startDate,
    endDate,
    ...transactionParams
  }: Types.SpreadsheetFunction): SnapshotReturn[] {
    const transactions = makeTransactions(transactionParams);

    const control: { [ticker: string]: LoggingUtils.Logger } = {};

    function handleOperation(transaction: Types.Transaction): void {
      if (!Object.prototype.hasOwnProperty.call(control, transaction.ticker)) {
        control[transaction.ticker] = new LoggingUtils.Logger();
      }

      control[transaction.ticker].entries = GoogleSheets.snapshotLogMsg(transaction);
    }

    const stats = Finance.statsFrom({
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
          log: control[ticker].entries,
        };
      }

      return {
        ticker,
        purchasedQuantity: 'NA',
        purchasedTotal: 'NA',
        soldQuantity: 'NA',
        soldTotal: 'NA',
        averagePrice: 'NA',
        log: control[ticker].entries,
      };
    });
  }
}

// Functions outside the namespace will be available in the Spreadsheet

function profit(
  year: number,
  month: number,
  portfolioStartingYear: number,
  portfolioStartingMonth: number,
  portfolioStartingDay: number,
  dates: Date[][],
  tickers: string[][],
  operations: string[][],
  quantities: number[][],
  totals: number[][],
  taxDeductions: number[][],
): (string | number)[] {
  const startDate = new DateUtils.CalendarDate(
    portfolioStartingYear,
    portfolioStartingMonth,
    portfolioStartingDay,
  );
  const endDate = new DateUtils.CalendarDate(year, month, DateUtils.daysIn(year, month));

  const stats = GoogleSheets.profit({
    startDate,
    endDate,
    dates,
    tickers,
    operations,
    quantities,
    totals,
    taxDeductions,
  });

  return [stats.total, stats.profit, stats.taxDeduction, stats.log];
}

function snapshot(
  startingYear: number,
  startingMonth: number,
  startingDay: number,
  endingYear: number,
  endingMonth: number,
  endingDay: number,
  dates: Date[][],
  tickers: string[][],
  operations: string[][],
  quantities: number[][],
  totals: number[][],
): (string | number)[][] {
  const startDate = new DateUtils.CalendarDate(startingYear, startingMonth, startingDay);
  const endDate = new DateUtils.CalendarDate(endingYear, endingMonth, endingDay);

  const stats = GoogleSheets.snapshot({
    startDate,
    endDate,
    dates,
    tickers,
    operations,
    quantities,
    totals,
  });

  return stats.map((entry) => [
    entry.ticker,
    entry.purchasedQuantity,
    entry.purchasedTotal,
    entry.soldQuantity,
    entry.soldTotal,
    entry.averagePrice,
    entry.log,
  ]);
}
