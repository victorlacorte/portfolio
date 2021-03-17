import { operations } from './constants';

export type Operation = typeof operations[number];

type BasicDate = {
  year: number;
  month: number;
  day: number;
};

export type CalendarDate = {
  toJSDate(): Date;
  valid(): boolean;
} & BasicDate;

export type Stats = {
  [ticker: string]: {
    averagePrice: number;
    purchased: StatsControl;
    sold: StatsControl;
  };
};

type StatsControl = {
  qty: number;
  total: number;
};

export type OperationCallback = (
  transaction: Transaction,
  stats: Stats,
) => void;

export type Transaction = {
  date: CalendarDate;
  ticker: string;
  operation: Operation;
  quantity: number;
  averagePrice: number;
  transactionTax: number;
  // Present in sell transactions
  taxDeduction?: number;
};

export type SpreadsheetTransaction = {
  dates: Date[][];
  tickers: string[][];
  operations: string[][];
  quantities: number[][];
  totals: number[][];
  taxDeductions?: number[][];
};

export type SpreadsheetFunction = {
  startDate: CalendarDate;
  endDate: CalendarDate;
} & SpreadsheetTransaction;

export type Logger = {
  readonly entries: string[];
  join(separator: string): string;
  add(entry: string): void;
};
