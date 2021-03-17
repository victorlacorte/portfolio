import { expectedPositive, expectedPositiveOrZero } from 'src/utils/messages';
import type {
  CalendarDate,
  Operation,
  Transaction as _Transaction,
} from 'src/types';

/**
 * `averagePrice` might be zero as a side effect to include `buy` operations
 * that represent stock dividends (i.e. an increase in the position for no
 * cost), but `quantity` is probably strictly positive.
 */
export default class Transaction implements _Transaction {
  private readonly _date: CalendarDate;
  private readonly _ticker: string;
  private readonly _operation: Operation;
  private readonly _quantity: number;
  private readonly _averagePrice: number;
  private readonly _transactionTax: number;
  private readonly _taxDeduction?: number;

  constructor({
    date,
    ticker,
    operation,
    quantity,
    averagePrice,
    transactionTax,
    taxDeduction = 0,
  }: _Transaction) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(expectedPositive(quantity));
    }

    if (averagePrice < 0) {
      throw new Error(expectedPositiveOrZero(averagePrice));
    }

    if (transactionTax <= 0) {
      throw new Error(expectedPositive(transactionTax));
    }

    if (taxDeduction < 0) {
      throw new Error(expectedPositiveOrZero(taxDeduction));
    }

    this._date = date;
    this._ticker = ticker.toLowerCase();
    this._operation = operation.toLowerCase() as Operation;
    this._quantity = quantity;
    this._averagePrice = averagePrice;
    this._transactionTax = transactionTax;
    this._taxDeduction = taxDeduction;
  }

  get date(): CalendarDate {
    return this._date;
  }

  get ticker(): string {
    return this._ticker;
  }

  get operation(): Operation {
    return this._operation;
  }

  get quantity(): number {
    return this._quantity;
  }

  get averagePrice(): number {
    return this._averagePrice;
  }

  get transactionTax(): number {
    return this._transactionTax;
  }

  get taxDeduction(): number {
    return this._taxDeduction;
  }

  toJSON(): _Transaction {
    return {
      date: this.date,
      ticker: this.ticker,
      operation: this.operation,
      quantity: this.quantity,
      averagePrice: this.averagePrice,
      transactionTax: this.transactionTax,
      taxDeduction: this.taxDeduction,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
