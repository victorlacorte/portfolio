import { add, div, mul, sub } from 'src/utils/number';
import { invalidSellQty } from 'src/utils/messages';
import type { OperationCallback, Stats, Transaction } from 'src/types';

const makeDefaultStats = (): Stats[keyof Stats] => ({
  averagePrice: 0,
  purchased: {
    qty: 0,
    total: 0,
  },
  sold: {
    qty: 0,
    total: 0,
  },
});

export default class Portfolio {
  private readonly _stats: Stats = {};
  private readonly _onBuy?: OperationCallback;
  private readonly _onSell?: OperationCallback;

  constructor(
    params: {
      onBuy?: OperationCallback;
      onSell?: OperationCallback;
    } = {},
  ) {
    const { onBuy = null, onSell = null } = params;

    this._onBuy = onBuy;
    this._onSell = onSell;
  }

  toString(): string {
    return JSON.stringify(this._stats);
  }

  // Copy of this._stats
  get stats(): Stats {
    return JSON.parse(this.toString());
  }

  add(t: Transaction): void {
    if (t.operation === 'buy') {
      this.addBuyTransaction(t);
    } else if (t.operation === 'sell') {
      this.addSellTransaction(t);
    }
  }

  private addBuyTransaction(t: Transaction): void {
    const { ticker, quantity, averagePrice, transactionTax } = t;

    if (!Object.prototype.hasOwnProperty.call(this._stats, ticker)) {
      this._stats[ticker] = makeDefaultStats();
    }
    const transactionTotal = add(mul(averagePrice, quantity), transactionTax);

    if (!this._stats[ticker].averagePrice) {
      this._stats[ticker].averagePrice = div(transactionTotal, quantity);
    } else {
      const currentQty = sub(
        this._stats[ticker].purchased.qty,
        this._stats[ticker].sold.qty,
      );

      const currentValue = mul(this._stats[ticker].averagePrice, currentQty);

      this._stats[ticker].averagePrice = div(
        add(currentValue, transactionTotal),
        add(currentQty, quantity),
      );
    }

    this._stats[ticker].purchased.qty = add(
      this._stats[ticker].purchased.qty,
      quantity,
    );

    this._stats[ticker].purchased.total = add(
      this._stats[ticker].purchased.total,
      transactionTotal,
    );

    this._onBuy && this._onBuy(t, this.stats);
  }

  // TODO document we call the `onSell` callback before deleting `ticker` from `stats`
  private addSellTransaction(t: Transaction): void {
    const { ticker, quantity, averagePrice, transactionTax, taxDeduction } = t;

    if (
      !Object.prototype.hasOwnProperty.call(this._stats, ticker) ||
      quantity > this._stats[ticker].purchased.qty ||
      taxDeduction == 0
    ) {
      throw new Error(`Invalid sell transaction: ${JSON.stringify(t)}`);
    }

    this._stats[ticker].sold.qty = add(this._stats[ticker].sold.qty, quantity);

    this._stats[ticker].sold.total = sub(
      add(this._stats[ticker].sold.total, mul(averagePrice, quantity)),
      transactionTax,
    );

    this._onSell && this._onSell(t, this.stats);

    if (this._stats[ticker].purchased.qty == this._stats[ticker].sold.qty) {
      this._stats[ticker] = makeDefaultStats();
    }
  }
}
