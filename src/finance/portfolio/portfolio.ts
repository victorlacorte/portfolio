import { add, sub } from 'src/utils/number';
import type {
  BuyTransaction,
  Position,
  PositionEntry,
  ReverseSplitTransaction,
  SellTransaction,
  SplitTransaction,
  StockDividendTransaction,
  Transaction,
} from 'src/types';

import {
  averagePrice,
  buyTotal,
  divide,
  multiply,
  profit,
  profitPercent,
  sellTotal,
} from '../functions';

type Reducer<T extends Transaction> = (
  state: Position,
  transaction: T,
) => Position;

type Strategies = {
  [k in Transaction['kind']]: Reducer<Transaction>;
};

function hasTicker(state: Position, ticker: string): boolean {
  return Object.prototype.hasOwnProperty.call(state, ticker);
}

export function lastEntryFrom(
  state: Position,
  ticker: string,
): PositionEntry | null {
  const last = state[ticker];

  return last?.length > 0 ? last[last.length - 1] : null;
}

const buyEntry: Reducer<BuyTransaction> = (state, transaction) => {
  const { kind, date, price, quantity, tax, ticker } = transaction;

  if (!hasTicker(state, ticker)) {
    return {
      ...state,
      [ticker]: [
        {
          kind,
          buyQuantity: quantity,
          buyTotal: buyTotal(price, quantity, tax),
          date,
          price: averagePrice(price, quantity, tax),
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
      ...state[ticker],
      {
        kind,
        date,
        price: averagePrice(price, quantity, tax, prevPrice, prevQuantity),
        quantity: add(quantity, prevQuantity),
        buyQuantity: quantity,
        buyTotal: buyTotal(price, quantity, tax),
      },
    ],
  };
};

const sellEntry: Reducer<SellTransaction> = (state, transaction) => {
  const { kind, date, price, quantity, tax, ticker, irrf } = transaction;

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
      ...state[ticker],
      {
        kind,
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
};

const splitEntry: Reducer<SplitTransaction> = (state, transaction) => {
  const { kind, date, factor, ticker } = transaction;

  if (!hasTicker(state, ticker)) {
    throw new Error(`Ticker ${ticker} missing from ${state}`);
  }

  const prev = lastEntryFrom(state, ticker);

  return {
    ...state,
    [ticker]: [
      ...state[ticker],
      {
        kind,
        date,
        price: divide(prev.price, factor),
        quantity: multiply(prev.quantity, factor),
      },
    ],
  };
};

const reverseSplitEntry: Reducer<ReverseSplitTransaction> = (
  state,
  transaction,
) => {
  const { kind, date, factor, ticker } = transaction;

  if (!hasTicker(state, ticker)) {
    throw new Error(`Ticker ${ticker} missing from ${state}`);
  }

  const prev = lastEntryFrom(state, ticker);

  return {
    ...state,
    [ticker]: [
      ...state[ticker],
      {
        kind,
        date,
        price: multiply(prev.price, factor),
        quantity: divide(prev.quantity, factor),
      },
    ],
  };
};

const stockDividendEntry: Reducer<StockDividendTransaction> = (
  state,
  transaction,
) => {
  const { kind, date, quantity, ticker } = transaction;

  if (!hasTicker(state, ticker)) {
    throw new Error(`Ticker ${ticker} missing from ${state}`);
  }

  const { price: prevPrice, quantity: prevQuantity } = lastEntryFrom(
    state,
    ticker,
  );

  return {
    ...state,
    [ticker]: [
      ...state[ticker],
      {
        kind,
        date,
        price: averagePrice(0, quantity, 0, prevPrice, prevQuantity),
        quantity: add(prevQuantity, quantity),
      },
    ],
  };
};

const strategies: Strategies = {
  buy: buyEntry,
  sell: sellEntry,
  split: splitEntry,
  'reverse split': reverseSplitEntry,
  'stock dividend': stockDividendEntry,
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
