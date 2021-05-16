import { operations, positionColumnNames } from '../constants';
import { valuesFrom } from './helpers';

import Portfolio from '../finance/portfolio';
import SimpleDate from '../utils/date';
import type { Operation, SimpleDate as _SimpleDate } from '../types';

/**
 * Parse information from and to the spreadsheet context
 */

function sanitizeOperation(x: unknown): Operation {
  const valid = x.toString().toLowerCase() as Operation;

  if (!operations.includes(valid)) {
    throw new Error(`Invalid operation: ${x}`);
  }

  return valid;
}

function makeSimpleDates({
  years,
  months,
  days,
}: {
  years: unknown[];
  months: unknown[];
  days: unknown[];
}): _SimpleDate[] {
  return Array.from({ length: years.length }).map((_, i) =>
    SimpleDate.make(Number(years[i]), Number(months[i]), Number(days[i])),
  );
}

// Normalize return information
const defaultPortfolioSellEntry = {
  irrf: null,
  soldTotal: null,
  profit: null,
  profitPercent: null,
};

export function position(
  rawYears: unknown[][],
  rawMonths: unknown[][],
  rawDays: unknown[][],
  rawTickers: unknown[][],
  rawOperations: unknown[][],
  rawQuantities: unknown[][],
  rawPrices: unknown[][],
  rawTaxes: unknown[][],
  rawIrrfs: unknown[][],
) {
  // 1. process each unknown[][] to its typed counterpart e.g.
  // years: unknown[][] -> years: Range<number>
  // 2. "slice" each ticker and Promise.all to process them in parallel
  const years = rawYears.flat();
  const months = rawMonths.flat();
  const days = rawDays.flat();
  const tickers = rawTickers.flat();
  const operations = rawOperations.flat();
  const quantities = rawQuantities.flat();
  const prices = rawPrices.flat();
  const taxes = rawTaxes.flat();
  const irrfs = rawIrrfs.flat();

  const portfolio = new Portfolio();

  makeSimpleDates({ years, months, days })
    .sort((d1, d2) => Number(d1.toJSDate()) - Number(d2.toJSDate()))
    .forEach((d, i) => {
      const price = Number(prices[i]);
      const tax = Number(taxes[i]);
      const ticker = tickers[i].toString().toLowerCase();
      const quantity = Number(quantities[i]);
      const irrf = irrfs[i] ? Number(irrfs[i]) : null;

      portfolio.add({
        date: d,
        price,
        tax,
        ticker,
        quantity:
          sanitizeOperation(operations[i]) === 'sell' ? -quantity : quantity,
        irrf,
      });
    });

  // TODO return header from v[0]?
  return [
    ['ticker', ...positionColumnNames.sort()],
    ...Object.entries(portfolio.position).flatMap(([k, v]) =>
      v.map((props) => [k, ...valuesFrom(props, positionColumnNames, 0)]),
    ),
  ];
}
