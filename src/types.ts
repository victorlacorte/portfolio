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

type SplitTransaction = {
  ticker: string;
  date: SimpleDate;
  factor: number;
};

type StockDividendTransaction = {
  ticker: string;
  date: SimpleDate;
  quantity: number;
};

// Transaction kinds are important to the portfolio reducer.
export type Transaction =
  | ({ kind: 'buy' } & BuySellTransaction)
  | ({ kind: 'sell'; irrf: number } & BuySellTransaction)
  | ({ kind: 'split' } & SplitTransaction)
  | ({ kind: 'reverse split' } & SplitTransaction)
  | ({ kind: 'stock dividend' } & StockDividendTransaction);

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

export type BuyEntry = { kind: 'buy' } & Record<
  typeof buyEntryKeys[number],
  number
>;

export type SellEntry = { kind: 'sell' } & Record<
  typeof sellEntryKeys[number],
  number
>;

// This is enough to cover splits, reverse splits and stock dividends
export type OtherEntry = { kind: 'other' };

export type PositionEntry = BaseEntry & (BuyEntry | SellEntry | OtherEntry);

// export type PositionEntry = {
//   [key in typeof numberColumnNames[number]]: number;
// } & { date: Transaction['date'] }; // { [key in typeof stringColumnNames[number]]: string };

// export type Position = {
//   [ticker: string]: PositionEntry[];
// };

export type Position = Record<string, PositionEntry[]>;

// TODO it might be easier to construct a reducer style function
export type Portfolio = {
  position: Position;
  add(t: Transaction): void;
};
