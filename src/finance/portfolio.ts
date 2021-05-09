import { add } from '../utils/number';
import type { Portfolio, Position, Transaction } from '../types';

import { averagePrice, profit, profitPercent, sellTotal } from './functions';

export default class implements Portfolio {
  private readonly _position: Position = {};

  get position(): Position {
    return JSON.parse(JSON.stringify(this._position));
  }

  private _isTickerInPosition(ticker: string): boolean {
    return Object.prototype.hasOwnProperty.call(this._position, ticker);
  }

  private _lastEntry(ticker: string): Position[string][number] | null {
    const last = this._position[ticker];

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
  // Maybe validations could be performed here rather than on a new class
  private _addSellTransaction(t: Transaction): void {
    if (!this._isTickerInPosition(t.ticker)) {
      throw new Error(`Ticker ${t.ticker} missing from portfolio`);
    }

    const lastEntry = this._lastEntry(t.ticker);

    if (Math.abs(t.quantity) > lastEntry.quantity) {
      throw new Error('Invalid sell amount');
    }

    // TODO new Transaction
    this._position[t.ticker].push({
      date: t.date,
      price: lastEntry.price,
      // t.quantity < 0
      quantity: add(lastEntry.quantity, t.quantity),
      irrf: t.irrf, // TODO needs to be > 0
      soldTotal: sellTotal(t),
      profit: profit(t, lastEntry),
      profitPercent: profitPercent(t, lastEntry),
    });
  }

  private _addBuyTransaction(t: Transaction): void {
    if (!this._isTickerInPosition(t.ticker)) {
      this._position[t.ticker] = [];
    }

    const lastEntry = this._lastEntry(t.ticker);

    // TODO new Transaction
    this._position[t.ticker].push({
      date: t.date,
      price: lastEntry ? averagePrice(t, lastEntry) : averagePrice(t),
      quantity: lastEntry ? add(t.quantity, lastEntry.quantity) : t.quantity,
      irrf: 0,
      profit: 0,
      profitPercent: 0,
      soldTotal: 0,
    });
  }
}
