// import * as R from 'ramda';
import { add } from '../utils/number';
import type { Portfolio, Position, PositionEntry, Transaction } from '../types';

import {
  averagePrice,
  buyTotal,
  profit,
  profitPercent,
  sellTotal,
} from './functions';

function hasTicker(state: Position, ticker: string): boolean {
  return Object.prototype.hasOwnProperty.call(state, ticker);
}

function lastEntryFrom(state: Position, ticker: string): PositionEntry | null {
  const last = state[ticker];

  return last?.length > 0 ? last[last.length - 1] : null;
}

function buyTransaction() {}
function sellTransaction() {}
function splitTransaction() {}
function reverseSplitTransaction() {}
function stockDividendTransaction() {}

const portfolioReducer = {
  buyTransaction,
  sellTransaction,
  splitTransaction,
  // continue
};

// TODO truncate IRRF quantities
export default class implements Portfolio {
  private readonly _position: Position = {};

  // TODO this is a major cause of error. We are shallow cloning the _position
  get position(): Position {
    // return JSON.parse(JSON.stringify(this._position));
    // return R.clone(this._position);
    // return this._position;
    return { ...this._position };
  }

  private _isTickerInPosition(ticker: string): boolean {
    return Object.prototype.hasOwnProperty.call(this._position, ticker);
  }

  private _lastEntry(ticker: string): Position[string][number] | null {
    const last = this._position[ticker];

    return last.length > 0 ? last[last.length - 1] : null;
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
      sellIrrf: t.irrf, // TODO needs to be > 0
      sellProfit: profit(t, lastEntry),
      sellProfitPercent: profitPercent(t, lastEntry),
      sellQuantity: Math.abs(t.quantity),
      sellTotal: sellTotal(t),
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
      buyQuantity: t.quantity,
      buyTotal: buyTotal(t),
    });
  }
}
