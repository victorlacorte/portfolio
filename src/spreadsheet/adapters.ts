import { operations, positionColumnNames } from '../constants';
import { valuesFrom } from './helpers';

import { irpf as _irpf } from '../finance/irpf/functions';
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
  return Array.from({ length: years.length }).map((_, index) =>
    SimpleDate.make(
      Number(years[index]),
      Number(months[index]),
      Number(days[index]),
    ),
  );
}

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

  for (const [index, d] of makeSimpleDates({ years, months, days })
    .sort((d1, d2) => Number(d1.toJSDate()) - Number(d2.toJSDate()))
    .entries()) {
    const price = Number(prices[index]);
    const tax = Number(taxes[index]);
    const ticker = tickers[index].toString().toLowerCase();
    const quantity = Number(quantities[index]);
    const irrf = irrfs[index] ? Number(irrfs[index]) : null;

    portfolio.add({
      date: d,
      price,
      tax,
      ticker,
      quantity:
        sanitizeOperation(operations[index]) === 'sell' ? -quantity : quantity,
      irrf,
    });
  }

  return [
    // TODO abstract in a function
    ['ticker', ...positionColumnNames.sort()], // header
    ...Object.entries(portfolio.position).flatMap(([ticker, entry]) =>
      entry.map((props) => [
        ticker,
        // date.toString(),
        ...valuesFrom(props, positionColumnNames, 0).map((val) => String(val)),
      ]),
    ),
  ];
}

export function irpf(
  year: number,
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

  for (const [index, d] of makeSimpleDates({ years, months, days })
    .sort((d1, d2) => Number(d1.toJSDate()) - Number(d2.toJSDate()))
    .entries()) {
    const price = Number(prices[index]);
    const tax = Number(taxes[index]);
    const ticker = tickers[index].toString().toLowerCase();
    const quantity = Number(quantities[index]);
    const irrf = irrfs[index] ? Number(irrfs[index]) : null;

    portfolio.add({
      date: d,
      price,
      tax,
      ticker,
      quantity:
        sanitizeOperation(operations[index]) === 'sell' ? -quantity : quantity,
      irrf,
    });
  }

  return Object.entries(portfolio.position).map(([k, v]) => [
    k,
    ...valuesFrom(_irpf(year, v)),
  ]);
}
