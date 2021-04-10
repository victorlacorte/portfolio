import { add } from '../utils/number';
import type { Portfolio, PortfolioWrapper, Transaction } from '../types';

import { averagePrice, profit, profitPercent } from './functions';

export default class Wrapper implements PortfolioWrapper {
  private readonly _portfolio: Portfolio = {};

  get portfolio(): Portfolio {
    return JSON.parse(JSON.stringify(this._portfolio));
  }

  private _lastEntry(ticker: string): Portfolio[string][number] | null {
    const last = this._portfolio[ticker];

    return last.length ? last[last.length - 1] : null;
  }

  add(t: Transaction): void {
    if (t.quantity < 0) {
      this._addSellTransaction(t);
    } else {
      this._addBuyTransaction(t);
    }
  }

  // TODO improve error messages
  private _addSellTransaction(t: Transaction): void {
    if (!Object.prototype.hasOwnProperty.call(this._portfolio, t.ticker)) {
      throw new Error(`Ticker ${t.ticker} missing from portfolio`);
    }

    const lastEntry = this._lastEntry(t.ticker);

    if (Math.abs(t.quantity) > lastEntry.quantity) {
      throw new Error('Invalid sell amount');
    }

    // TODO new Transaction
    this._portfolio[t.ticker].push({
      date: t.date,
      price: lastEntry.price,
      // t.quantity < 0
      quantity: add(lastEntry.quantity, t.quantity),
      profit: profit(t, lastEntry),
      profitPercent: profitPercent(t, lastEntry),
    });
  }

  private _addBuyTransaction(t: Transaction): void {
    if (!Object.prototype.hasOwnProperty.call(this._portfolio, t.ticker)) {
      this._portfolio[t.ticker] = [];
    }

    const lastEntry = this._lastEntry(t.ticker);

    // TODO new Transaction
    this._portfolio[t.ticker].push({
      date: t.date,
      price: lastEntry ? averagePrice(t, lastEntry) : averagePrice(t),
      quantity: lastEntry ? add(t.quantity, lastEntry.quantity) : t.quantity,
    });
  }
}
