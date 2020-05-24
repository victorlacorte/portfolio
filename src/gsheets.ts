namespace GoogleSheets {
  export const snapshotHeader = [
    'Ticker',
    'Purchased qty.',
    'Purchased total',
    'Sold qty.',
    'Sold total',
    'Avg. price',
  ];

  export function profitLogMsg({
    year,
    month,
    day,
    ticker,
    total,
    profit,
    taxDeduction,
  }: {
    year: number;
    month: number;
    day: number;
    ticker: string;
    total: number;
    profit: number;
    taxDeduction: number;
  }): string {
    const parsedMonth = NumberUtils.padStart(month, 2),
      parsedDay = NumberUtils.padStart(day, 2),
      parsedTicker = ticker.toUpperCase(),
      parsedTotal = NumberUtils.toCurrency(total),
      parsedProfit = NumberUtils.toCurrency(profit),
      profitPercent = NumberUtils.toFixed((profit / total) * 100, 2),
      parsedTaxDeduction = NumberUtils.toCurrency(taxDeduction);

    return `${year}/${parsedMonth}/${parsedDay}: [${parsedTicker}] total=${parsedTotal}, profit=${parsedProfit} (${profitPercent}%), tax=${parsedTaxDeduction}`;
  }
}

function snapshot(
  year: number,
  month: number,
  dates: Date[][],
  tickers: string[][],
  operations: string[][],
  quantities: number[][],
  totals: number[][],
): (string | number)[][] {
  Finance.validateMonth(month);

  const [
    sanitizedDates,
    sanitizedTickers,
    sanitizedOperations,
    sanitizedQuantities,
    sanitizedTotals,
  ] = NamedRangeUtils.sanitize(dates, tickers, operations, quantities, totals);

  const stats = Finance.statsFrom({
    year,
    month,
    dates: sanitizedDates,
    tickers: sanitizedTickers,
    operations: sanitizedOperations,
    quantities: sanitizedQuantities,
    totals: sanitizedTotals,
  });

  const mappedStats = Object.keys(stats).map((ticker) => [
    ticker,
    stats[ticker].purchased.qty,
    stats[ticker].purchased.total,
    stats[ticker].sold.qty,
    stats[ticker].sold.total,
    NumberUtils.div(stats[ticker].purchased.total, stats[ticker].purchased.qty),
  ]);

  return ([GoogleSheets.snapshotHeader] as (string | number)[][]).concat(
    mappedStats,
  );
}

function profit(
  year: number,
  month: number,
  dates: Date[][],
  tickers: string[][],
  operations: string[][],
  quantities: number[][],
  totals: number[][],
  taxDeductions: number[][],
): (string | number)[] {
  Finance.validateMonth(month);

  const [
    sanitizedDates,
    sanitizedTickers,
    sanitizedOperations,
    sanitizedQuantities,
    sanitizedTotals,
    sanitizedTaxDeductions,
  ] = NamedRangeUtils.sanitize(
    dates,
    tickers,
    operations,
    quantities,
    totals,
    taxDeductions,
  );

  let total = 0;
  let profit = 0;
  let taxDeduction = 0;
  const logger = LoggingUtils.Logger.instance();

  function onSell(stats: Types.Stats, idx: number): void {
    if (!sanitizedTaxDeductions[idx]) {
      throw Constants.genericError(
        'IRRF > 0',
        sanitizedTaxDeductions[idx],
        idx + 1,
      );
    }

    const { year: currYear, month: currMonth, day: currDay } = DateUtils.parse(
      sanitizedDates[idx],
    );

    if (currYear === year && currMonth === month) {
      const currTicker = sanitizedTickers[idx].toLowerCase();

      const averagePrice = NumberUtils.div(
        stats[currTicker].purchased.total,
        stats[currTicker].purchased.qty,
      );

      const currProfit = NumberUtils.sub(
        sanitizedTotals[idx],
        NumberUtils.mul(sanitizedQuantities[idx], averagePrice),
      );

      total += sanitizedTotals[idx];
      profit += currProfit;
      taxDeduction += sanitizedTaxDeductions[idx];

      logger.log(
        GoogleSheets.profitLogMsg({
          year: currYear,
          month: currMonth,
          day: currDay,
          ticker: currTicker,
          profit: currProfit,
          taxDeduction: sanitizedTaxDeductions[idx],
          total: sanitizedTotals[idx],
        }),
      );
    }
  }

  Finance.statsFrom({
    year,
    month,
    dates: sanitizedDates,
    tickers: sanitizedTickers,
    operations: sanitizedOperations,
    quantities: sanitizedQuantities,
    totals: sanitizedTotals,
    onSell,
  });

  return [total, profit, taxDeduction, logger.view()];
}
