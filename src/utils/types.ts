export namespace Types {
  type BasicDate = {
    year: number;
    month: number;
    day: number;
  };

  export type CalendarDate = {
    toJSDate(): Date;
    valid(): boolean;
  } & BasicDate;

  type StatsControl = {
    qty: number;
    total: number;
  };

  export type Stats = {
    [ticker: string]: {
      purchased: StatsControl;
      sold: StatsControl;
    };
  };

  export enum Operation {
    Buy = 'buy',
    Sell = 'sell',
  }

  export type OperationCallback = (transaction: Transaction, stats: Stats) => void;

  export type Transaction = {
    date: CalendarDate;
    ticker: string;
    operation: Operation;
    quantity: number;
    total: number;
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
    startDate: Types.CalendarDate;
    endDate: Types.CalendarDate;
  } & SpreadsheetTransaction;

  export type Portfolio = {
    readonly stats: Stats;
    readonly onPurchase?: OperationCallback;
    readonly onSell?: OperationCallback;

    add(t: Transaction): void;
  };
}
