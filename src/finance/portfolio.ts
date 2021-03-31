import { add, div, mul, sub } from 'src/utils/number';
import type {
  BuySellEvent,
  Stats,
  Transaction as _Transaction,
} from 'src/types';

import Transaction from './transaction';

const makeDefaultStats = (): Stats[keyof Stats] => ({
  averagePrice: 0,
  purchased: {
    quantity: 0,
    total: 0,
  },
  sold: {
    quantity: 0,
    total: 0,
  },
});

export default class Portfolio {
  private readonly _stats: Stats = {};

  static make({
    onBuy,
    onSell,
  }: {
    onBuy?: BuySellEvent;
    onSell?: BuySellEvent;
  } = {}) {
    return new this(onBuy, onSell);
  }

  private constructor(
    private readonly _onBuy?: BuySellEvent,
    private readonly _onSell?: BuySellEvent,
  ) {}

  toString(): string {
    return JSON.stringify(this._stats);
  }

  // Copy of this._stats
  get stats(): Stats {
    return JSON.parse(this.toString());
  }

  add(t: _Transaction): void {
    if (t.operation === 'buy') {
      this.addBuyTransaction(t);
    } else if (t.operation === 'sell') {
      this.addSellTransaction(t);
    }
  }

  private addBuyTransaction(t: _Transaction): void {
    const { ticker, quantity, averagePrice, transactionTax } = t;

    if (!Object.prototype.hasOwnProperty.call(this._stats, ticker)) {
      this._stats[ticker] = makeDefaultStats();
    }

    const transactionTotal = add(mul(averagePrice, quantity), transactionTax);

    if (!this._stats[ticker].averagePrice) {
      this._stats[ticker].averagePrice = div(transactionTotal, quantity);
    } else {
      const currentQty = sub(
        this._stats[ticker].purchased.quantity,
        this._stats[ticker].sold.quantity,
      );

      const currentValue = mul(this._stats[ticker].averagePrice, currentQty);

      this._stats[ticker].averagePrice = div(
        add(currentValue, transactionTotal),
        add(currentQty, quantity),
      );
    }

    this._stats[ticker].purchased.quantity = add(
      this._stats[ticker].purchased.quantity,
      quantity,
    );

    this._stats[ticker].purchased.total = add(
      this._stats[ticker].purchased.total,
      transactionTotal,
    );

    this._onBuy &&
      this._onBuy(
        Transaction.make({
          averagePrice,
          quantity,
          ticker,
          transactionTax,
          date: t.date,
          operation: t.operation,
          taxDeduction: t.taxDeduction,
          total: transactionTotal,
        }),
        this.stats[ticker],
      );
  }

  // TODO document we call the `onSell` callback before deleting `ticker` from `stats`
  private addSellTransaction(t: _Transaction): void {
    const { ticker, quantity, averagePrice, transactionTax, taxDeduction } = t;

    if (
      !Object.prototype.hasOwnProperty.call(this._stats, ticker) ||
      quantity > this._stats[ticker].purchased.quantity
    ) {
      throw new Error(`Invalid sell transaction: ${JSON.stringify(t)}`);
    }

    this._stats[ticker].sold.quantity = add(
      this._stats[ticker].sold.quantity,
      quantity,
    );

    const transactionTotal = sub(mul(averagePrice, quantity), transactionTax);

    this._stats[ticker].sold.total = add(
      this._stats[ticker].sold.total,
      transactionTotal,
    );

    this._onSell &&
      this._onSell(
        Transaction.make({
          averagePrice,
          quantity,
          taxDeduction,
          ticker,
          transactionTax,
          date: t.date,
          operation: t.operation,
          total: transactionTotal,
        }),
        this.stats[ticker],
      );

    if (
      this._stats[ticker].purchased.quantity ==
      this._stats[ticker].sold.quantity
    ) {
      this._stats[ticker] = makeDefaultStats();
    }
  }
}
