import type {
  CalendarDate,
  Operation,
  Transaction as _Transaction,
  TransactionParams,
} from 'src/types';

import { validateTransaction } from './validation';

export default class Transaction implements _Transaction {
  static make(params: TransactionParams): _Transaction {
    const {
      date,
      ticker,
      operation,
      quantity,
      averagePrice,
      transactionTax,
      total,
      taxDeduction,
    } = params;

    return new this(
      date,
      ticker,
      operation,
      quantity,
      averagePrice,
      transactionTax,
      total,
      taxDeduction,
    );
  }

  validate(): void {
    validateTransaction(this);
  }

  private constructor(
    private readonly _date: CalendarDate,
    private readonly _ticker: string,
    private readonly _operation: Operation,
    private readonly _quantity: number,
    private readonly _averagePrice: number,
    private readonly _transactionTax: number,
    private readonly _total?: number,
    private readonly _taxDeduction?: number,
  ) {}

  get date(): CalendarDate {
    return this._date;
  }

  get ticker(): string {
    return this._ticker.toLowerCase();
  }

  get operation(): Operation {
    return this._operation.toLowerCase() as Operation;
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

  get total(): number {
    return this._total;
  }

  get taxDeduction(): number {
    return this._taxDeduction;
  }

  toJSON(): TransactionParams {
    return {
      date: this.date,
      ticker: this.ticker,
      operation: this.operation,
      quantity: this.quantity,
      averagePrice: this.averagePrice,
      transactionTax: this.transactionTax,
      total: this.total,
      taxDeduction: this.taxDeduction,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
