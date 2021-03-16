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
  private readonly _onPurchase?: OperationCallback;
  private readonly _onSell?: OperationCallback;

  constructor(
    params: {
      onPurchase?: OperationCallback;
      onSell?: OperationCallback;
    } = {},
  ) {
    const { onPurchase = null, onSell = null } = params;

    this._onPurchase = onPurchase;
    this._onSell = onSell;
  }

  // Copy of this._stats
  get stats(): Stats {
    return JSON.parse(JSON.stringify(this._stats));
  }

  add(t: Transaction): void {
    if (t.operation === 'buy') {
      this.addBuyTransaction(t);
    } else if (t.operation === 'sell') {
      this.addSellTransaction(t);
    }
  }

  // We don't need call number.add when dealing with integer amounts e.g. purchased or sold quantities
  private addBuyTransaction(t: Transaction): void {
    const { ticker, quantity, total } = t;

    if (!Object.prototype.hasOwnProperty.call(this._stats, ticker)) {
      this._stats[ticker] = makeDefaultStats();
    }

    if (!this._stats[ticker].averagePrice) {
      this._stats[ticker].averagePrice = div(total, quantity);
    } else {
      const currentQty = sub(
        this._stats[ticker].purchased.qty,
        this._stats[ticker].sold.qty,
      );

      const currentValue = mul(this._stats[ticker].averagePrice, currentQty);

      this._stats[ticker].averagePrice = div(
        add(currentValue, total),
        add(currentQty, quantity),
      );
    }

    this._stats[ticker].purchased.qty = add(
      this._stats[ticker].purchased.qty,
      quantity,
    );

    this._stats[ticker].purchased.total = add(
      this._stats[ticker].purchased.total,
      total,
    );

    this._onPurchase && this._onPurchase(t, this.stats);
  }

  private addSellTransaction(t: Transaction): void {
    const { ticker, quantity, total } = t;

    if (
      !Object.prototype.hasOwnProperty.call(this._stats, ticker) ||
      quantity > this._stats[ticker].purchased.qty
    ) {
      throw new Error(invalidSellQty);
    }

    this._stats[ticker].sold.qty = add(this._stats[ticker].sold.qty, quantity);

    this._stats[ticker].sold.total = add(this._stats[ticker].sold.total, total);

    this._onSell && this._onSell(t, this.stats);

    if (this._stats[ticker].purchased.qty == this._stats[ticker].sold.qty) {
      this._stats[ticker] = makeDefaultStats();
    }
  }

  toString(): string {
    return JSON.stringify(this._stats);
  }
}
