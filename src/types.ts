import { buyEntryKeys, sellEntryKeys, transactionKinds } from './constants';

// export type Operation = typeof operations[number];

// TODO review which types are actually present in the project
// Some of these might make sense only in the src/finance context
export type SimpleDate = {
  year: number;
  month: number;
  day: number;
  equals(s: SimpleDate): boolean;
  toJSDate(): Date;
  toJSON(): string;
  toString(): string;
};

type BuySellTransaction = {
  ticker: string;
  date: SimpleDate;
  quantity: number;
  price: number;
  tax: number;
};

type BaseSplitTransaction = {
  ticker: string;
  date: SimpleDate;
  factor: number;
};

type TransactionKind<T extends typeof transactionKinds[number]> = {
  kind: T;
};

export type BuyTransaction = TransactionKind<'buy'> & BuySellTransaction;

export type SellTransaction = {
  irrf: number;
} & TransactionKind<'sell'> &
  BuySellTransaction;

export type SplitTransaction = TransactionKind<'split'> & BaseSplitTransaction;

export type ReverseSplitTransaction = TransactionKind<'reverse split'> &
  BaseSplitTransaction;

export type StockDividendTransaction = {
  ticker: string;
  date: SimpleDate;
  quantity: number;
} & TransactionKind<'stock dividend'>;

export type Transaction =
  | BuyTransaction
  | SellTransaction
  | SplitTransaction
  | ReverseSplitTransaction
  | StockDividendTransaction;

// const numberColumnNames = [
//   'quantity',
//   'price',
//   'buyQuantity',
//   'buyTotal',
//   'sellIrrf',
//   'sellQuantity',
//   'sellTotal',
//   'sellProfit',
//   'sellProfitPercent',
// ] as const;

// const stringColumnNames = ['date'] as const;

// export type PositionEntry = {
//   date: Transaction['date'];
//   quantity: Transaction['quantity'];
//   price: Transaction['price'];
//   buyQuantity: Transaction['quantity'];
//   buyTotal: number;
//   sellIrrf: Transaction['irrf'];
//   sellQuantity: Transaction['quantity'];
//   sellTotal: number;
//   sellProfit: number;
//   sellProfitPercent: number;
// };

// Indexed by ticker
// type BuyEntry = {
//   buyQuantity: Transaction['quantity'];
//   buyTotal: number;
// };

// TODO Seems safe to assume these types are relevant only for the portfolio

type BaseEntry = {
  date: SimpleDate;
  quantity: number;
  price: number;
};

type BuyEntry = TransactionKind<'buy'> &
  Record<typeof buyEntryKeys[number], number>;

type SellEntry = TransactionKind<'sell'> &
  Record<typeof sellEntryKeys[number], number>;

type SplitEntry = TransactionKind<'split'>;
type ReverseSplitEntry = TransactionKind<'reverse split'>;
type StockDividendEntry = TransactionKind<'stock dividend'>;

export type PositionEntry = BaseEntry &
  (BuyEntry | SellEntry | SplitEntry | ReverseSplitEntry | StockDividendEntry);

// export type PositionEntry = {
//   [key in typeof numberColumnNames[number]]: number;
// } & { date: Transaction['date'] }; // { [key in typeof stringColumnNames[number]]: string };

// export type Position = {
//   [ticker: string]: PositionEntry[];
// };

export type Position = Record<string, PositionEntry[]>;
