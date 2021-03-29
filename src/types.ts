import { operations } from './constants';

export type Operation = typeof operations[number];

export type NamedRange<T> = T[][];

type SpreadsheetColumn =
  | 'date'
  | 'ticker'
  | 'operation'
  | 'quantity'
  | 'averagePrice'
  | 'transactionTax'
  | 'taxDeduction';

export type SpreadsheetTransaction = Record<
  SpreadsheetColumn,
  NamedRange<string>
>;

export type DateBase = {
  year: number;
  month: number;
  day: number;
};

export type SimpleDate = {
  toJSDate(): Date;
  toString(): string;
  toJSON(): DateBase;
} & DateBase;

export type Stats = {
  [ticker: string]: {
    averagePrice: number;
    purchased: StatsControl;
    sold: StatsControl;
  };
};

type StatsControl = {
  quantity: number;
  total: number;
};

export type BuySellEvent = (t: Transaction, s: Stats[keyof Stats]) => void;

export type TransactionBase = {
  date: SimpleDate;
  ticker: string;
  operation: Operation;
  quantity: number;
  averagePrice: number;
  transactionTax: number;
  // Might still be undefined
  total?: number;
  // Present in sell transactions
  taxDeduction?: number;
};

export type Transaction = {
  toString(): string;
  toJSON(): TransactionBase;
} & TransactionBase;

// export type SpreadsheetFunction = {
//   startDate?: SimpleDate;
//   endDate?: SimpleDate;
// } & SpreadsheetTransaction;

export type Logger = {
  readonly entries: string[];
  join(separator: string): string;
  add(entry: string): void;
};
