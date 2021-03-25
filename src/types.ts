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
  quantity: number;
  total: number;
};

// onTransaction: the parameters should be changed, though
export type BuySellEvent = (
  t: Transaction & { total: number },
  s: Stats[keyof Stats],
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

// export type SpreadsheetFunction = {
//   startDate?: CalendarDate;
//   endDate?: CalendarDate;
// } & SpreadsheetTransaction;

export type Logger = {
  readonly entries: string[];
  join(separator: string): string;
  add(entry: string): void;
};
