/**
 * `position` -> make transactions to be fed into the Portfolio class and
 * return the Portfolio.position as an array (to be storable into the
 * spreadsheet).  The result will then be served as input to the current
 * position and profit functions.
 *
 * Might aid writing the return value: https://stackoverflow.com/a/60142095
 */
declare function position(
  years: unknown[][],
  months: unknown[][],
  days: unknown[][],
  tickers: unknown[][],
  operations: unknown[][],
  quantities: unknown[][],
  prices: unknown[][],
  taxes: unknown[][],
  irrfs: unknown[][],
); // -> [keyof Position, ...Position[ticker]]

// Trivial function: obtain the last entry of every ticker, multiply quantity
// and price and return.
declare function openPosition(
  dates: unknown[][],
  tickers: unknown[][],
  quantities: unknown[][],
  prices: unknown[][],
);

// We need to access the "raw" backlog in order to obtain the sold total for a
// given year-month, and the result from `position` to visualize individual ticker
// profits and profit percentages.
// The conclusion is that the sold total should also belong to the
// `Portfolio.position` entry since it should be the single source of truth.
declare function profit(
  dates: unknown[][],
  tickers: unknown[][],
  irrfs: unknown[][],
  soldTotals: unknown[][],
  profits: unknown[][],
  profitPercents: unknown[][],
);

declare function irpf(
  year: unknown,
  dates: unknown[][],
  tickers: unknown[][],
  quantities: unknown[][],
  soldTotals: unknown[][],
);
