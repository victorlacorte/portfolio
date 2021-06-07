import { buyEntryKeys, sellEntryKeys } from './constants';

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

export type BuyTransaction = {
  kind: 'buy';
} & BuySellTransaction;

export type SellTransaction = {
  kind: 'sell';
  irrf: number;
} & BuySellTransaction;

export type SplitTransaction = {
  kind: 'split';
} & BaseSplitTransaction;

export type ReverseSplitTransaction = {
  kind: 'reverse split';
} & BaseSplitTransaction;

export type StockDividendTransaction = {
  kind: 'stock dividend';
  ticker: string;
  date: SimpleDate;
  quantity: number;
};

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

type BuyEntry = { kind: 'buy' } & Record<typeof buyEntryKeys[number], number>;

type SellEntry = { kind: 'sell' } & Record<
  typeof sellEntryKeys[number],
  number
>;

// This is enough to cover splits, reverse splits and stock dividends
type OtherEntry = { kind: 'other' };

export type PositionEntry = BaseEntry & (BuyEntry | SellEntry | OtherEntry);

// export type PositionEntry = {
//   [key in typeof numberColumnNames[number]]: number;
// } & { date: Transaction['date'] }; // { [key in typeof stringColumnNames[number]]: string };

// export type Position = {
//   [ticker: string]: PositionEntry[];
// };

export type Position = Record<string, PositionEntry[]>;
