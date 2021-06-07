import { add, sub } from '../utils/number';
import type {
  BuyTransaction,
  Position,
  PositionEntry,
  SellTransaction,
  Transaction,
} from '../types';

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

function buyEntry(state: Position, transaction: BuyTransaction): Position {
  const { date, price, quantity, tax, ticker } = transaction;

  if (!hasTicker(state, ticker)) {
    return {
      ...state,
      [ticker]: [
        {
          kind: 'buy',
          buyQuantity: quantity,
          buyTotal: buyTotal(price, quantity, tax),
          date,
          price,
          quantity,
        },
      ],
    };
  }

  const { price: prevPrice, quantity: prevQuantity } = lastEntryFrom(
    state,
    ticker,
  );

  return {
    ...state,
    [ticker]: [
      ...state.ticker,
      {
        kind: 'buy',
        date,
        price: averagePrice(price, quantity, tax, prevPrice, prevQuantity),
        quantity: add(quantity, prevQuantity),
        buyQuantity: quantity,
        buyTotal: buyTotal(price, quantity, tax),
      },
    ],
  };
}

function sellEntry(state: Position, transaction: SellTransaction): Position {
  const { date, price, quantity, tax, ticker, irrf } = transaction;

  if (!hasTicker(state, ticker)) {
    throw new Error(`Ticker ${ticker} missing from ${state}`);
  }

  const { price: prevPrice, quantity: prevQuantity } = lastEntryFrom(
    state,
    ticker,
  );

  if (quantity > prevQuantity) {
    throw new Error(`Invalid sell amount: ${quantity} > ${prevQuantity}`);
  }

  return {
    ...state,
    [ticker]: [
      ...state.ticker,
      {
        kind: 'sell',
        date,
        price: prevPrice,
        quantity: sub(prevQuantity, quantity),
        sellIrrf: irrf,
        sellProfit: profit(price, quantity, tax, prevPrice),
        sellProfitPercent: profitPercent(price, quantity, tax, prevPrice),
        sellQuantity: quantity,
        sellTotal: sellTotal(price, quantity, tax),
      },
    ],
  };
}

function addSplit() {}
function addReverseSplit() {}
function addStockDividend() {}

const strategies = {
  buy: buyEntry,
  sell: sellEntry,
};

export default function portfolioReducer(
  state: Position,
  transaction: Transaction,
): Position {
  if (!Object.prototype.hasOwnProperty.call(strategies, transaction.kind)) {
    throw new Error(`${transaction.kind} not implemented`);
  }

  return strategies[transaction.kind](state, transaction);
}
