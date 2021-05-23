import { buyEntryKeys, operations, sellEntryKeys } from './constants';

export type Operation = typeof operations[number];

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

export type Transaction = {
  ticker: string;
  date: SimpleDate;
  quantity: number;
  price: number;
  tax: number;
  // irrf not optional when quantity < 0 i.e. sell transaction
  irrf?: number; // individual income tax?
};

// TODO buyPrice = (price * quantity + tax) / quantity
// TODO notice we don't enforce much with this type: we can enter weird
// combinations of buy/sell info in the transaction
// TODO we need to have column names somewhere

const numberColumnNames = [
  'quantity',
  'price',
  'buyQuantity',
  'buyTotal',
  'sellIrrf',
  'sellQuantity',
  'sellTotal',
  'sellProfit',
  'sellProfitPercent',
] as const;

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

export type BaseEntry = {
  date: Transaction['date'];
  quantity: Transaction['quantity'];
  price: Transaction['price'];
};

export type BuyEntry = Record<typeof buyEntryKeys[number], number>;

export type SellEntry = Record<typeof sellEntryKeys[number], number>;

export type PositionEntry = BaseEntry &
  (
    | (BuyEntry & Partial<Record<keyof SellEntry, never>>)
    | (SellEntry & Partial<Record<keyof BuyEntry, never>>)
  );

// export type PositionEntry = {
//   [key in typeof numberColumnNames[number]]: number;
// } & { date: Transaction['date'] }; // { [key in typeof stringColumnNames[number]]: string };

// export type Position = {
//   [ticker: string]: PositionEntry[];
// };

export type Position = Record<string, PositionEntry[]>;

export type Portfolio = {
  position: Position;
  add(t: Transaction): void;
};
