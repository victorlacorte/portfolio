import { add, div, mul } from './utils/number';
import {
  invalidSellQty,
  expectedPostive,
  expectedPostiveOrZero,
} from './utils/messages';
import type {
  CalendarDate,
  Operation,
  OperationCallback,
  Stats,
  Transaction as TransactionType,
} from './utils/types';

export class Portfolio implements Portfolio {
  private readonly _stats: Stats = {};
  private readonly _onPurchase: OperationCallback;
  private readonly _onSell: OperationCallback;

  constructor(onPurchase: OperationCallback, onSell: OperationCallback) {
    this._onPurchase = onPurchase;
    this._onSell = onSell;
  }

  get stats(): Stats {
    return this._stats;
  }

  get onPurchase(): OperationCallback {
    return this._onPurchase;
  }

  get onSell(): OperationCallback {
    return this._onSell;
  }

  add(t: Transaction): void {
    if (t.operation === 'buy') {
      this.addBuyTransaction(t);
    } else if (t.operation === 'sell') {
      this.addSellTransaction(t);
    }
  }

  // We don't call add when dealing with integer amounts e.g. purchased or sold quantities
  private addBuyTransaction(t: Transaction): void {
    const { ticker, quantity, total } = t;

    if (!Object.prototype.hasOwnProperty.call(this.stats, ticker)) {
      this.stats[ticker] = {
        purchased: {
          qty: 0,
          total: 0,
        },
        sold: {
          qty: 0,
          total: 0,
        },
        averagePrice: 0,
      };
    }

    if (!this.stats[ticker].averagePrice) {
      this.stats[ticker].averagePrice = div(total, quantity);
    } else {
      const currentQty =
        this.stats[ticker].purchased.qty - this.stats[ticker].sold.qty;
      const currentValue = mul(this.stats[ticker].averagePrice, currentQty);

      this.stats[ticker].averagePrice = div(
        add(currentValue, total),
        currentQty + quantity,
      );
    }

    this.stats[ticker].purchased.qty += quantity;
    this.stats[ticker].purchased.total = add(
      this.stats[ticker].purchased.total,
      total,
    );

    this.onPurchase(t, this.stats);
  }

  // TODO is it really necessary to delete closed positions?
  private addSellTransaction(t: Transaction): void {
    const { ticker, quantity, total } = t;
    if (
      !Object.prototype.hasOwnProperty.call(this.stats, ticker) ||
      quantity > this.stats[ticker].purchased.qty
    ) {
      throw new Error(invalidSellQty);
    }

    this.stats[ticker].sold.qty += quantity;
    this.stats[ticker].sold.total = add(this.stats[ticker].sold.total, total);

    this.onSell(t, this.stats);

    if (this.stats[ticker].purchased.qty == this.stats[ticker].sold.qty) {
      delete this.stats[ticker];
    }
  }

  toString(): string {
    return JSON.stringify(this.stats);
  }
}

/**
 * `Total` might be zero as a side effect to include `buy` operations that
 * represent stock dividends (i.e. an increase in the position for no cost),
 * but `quantity` seems to be strictly positive.
 */
export class Transaction implements TransactionType {
  private readonly _date: CalendarDate;
  private readonly _ticker: string;
  private readonly _operation: Operation;
  private readonly _quantity: number;
  private readonly _total: number;
  private readonly _taxDeduction: number;

  constructor({
    date,
    ticker,
    operation,
    quantity,
    total,
    taxDeduction,
  }: TransactionType) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(expectedPostive(quantity));
    }

    if (total < 0) {
      throw new Error(expectedPostiveOrZero(total));
    }

    if (isFinite(taxDeduction) && taxDeduction < 0) {
      throw new Error(expectedPostiveOrZero(taxDeduction));
    }

    this._date = date;
    this._ticker = ticker.toLowerCase();
    this._operation = operation.toLowerCase() as Operation;
    this._quantity = quantity;
    this._total = total;
    this._taxDeduction = taxDeduction || 0;
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

  get total(): number {
    return this._total;
  }

  get taxDeduction(): number {
    return this._taxDeduction;
  }

  toJSON(): TransactionType {
    return {
      date: this.date,
      ticker: this.ticker,
      operation: this.operation,
      quantity: this.quantity,
      total: this.total,
      taxDeduction: this.taxDeduction,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}

export function statsFrom({
  startDate,
  endDate,
  transactions,
  onPurchase = () => {},
  onSell = () => {},
}: {
  startDate: CalendarDate;
  endDate: CalendarDate;
  transactions: Transaction[];
  onPurchase?: OperationCallback;
  onSell?: OperationCallback;
}): Stats {
  const start = startDate.toJSDate();
  const end = endDate.toJSDate();

  const p = new Portfolio(onPurchase, onSell);

  transactions
    .filter((t) => t.date.toJSDate() >= start && t.date.toJSDate() <= end)
    .sort((t1, t2) => Number(t1.date.toJSDate()) - Number(t2.date.toJSDate()))
    .forEach((t) => {
      p.add(t);
    });

  return p.stats;
}
