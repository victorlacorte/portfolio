import { columnNames, operations } from './constants';
// export type Range<T> = T[];

// export type NamedRange = Range<unknown>[];

export type ColumnName = typeof columnNames[number];

export type Operation = typeof operations[number];

// export type Backlog = Record<ColumnName, RawRange>;

// type ParsedBacklogEntry<T> = { [k in keyof Backlog]: SanitizedRange<T> };

// Create an object to map each entry to its parsing function
// export type ParseBacklogEntry<T> = (entry: keyof Backlog) => SanitizedRange<T>;

// export type ParsedBacklog = {
//   year: SanitizedRange<number>;
//   month: SanitizedRange<number>;
//   day: SanitizedRange<number>;
//   ticker: SanitizedRange<string>;
//   operation: SanitizedRange<Operation>;
//   quantity: SanitizedRange<number>; // integer
//   price: SanitizedRange<number>;
//   tax: SanitizedRange<number>;
//   irrf: SanitizedRange<number>;
// };

// type ParsedBacklog = {[k: keyof Backlog ]: Backlog}

// export type SpreadsheetPosition = {
//   years: SanitizedRange<number>;
//   months: SanitizedRange<number>;
//   days: SanitizedRange<number>;
//   tickers: SanitizedRange<string>;
//   operations: SanitizedRange<Operation>;
//   quantities: SanitizedRange<number>; // integer
//   prices: SanitizedRange<number>;
//   taxes: SanitizedRange<number>;
//   irrfs: SanitizedRange<number>;
// };
