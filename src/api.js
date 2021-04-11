/* eslint-disable */

function profit(
  year,
  month,
  portfolioStartingYear,
  portfolioStartingMonth,
  portfolioStartingDay,
  dates,
  tickers,
  operations,
  quantities,
  totals,
  taxDeductions,
) {
  return Portfolio.profit(
    year,
    month,
    portfolioStartingYear,
    portfolioStartingMonth,
    portfolioStartingDay,
    dates,
    tickers,
    operations,
    quantities,
    totals,
    taxDeductions,
  );
}

function snapshot(
  startingYear,
  startingMonth,
  startingDay,
  endingYear,
  endingMonth,
  endingDay,
  dates,
  tickers,
  operations,
  quantities,
  totals,
) {
  return Portfolio.snapshot(
    startingYear,
    startingMonth,
    startingDay,
    endingYear,
    endingMonth,
    endingDay,
    dates,
    tickers,
    operations,
    quantities,
    totals,
  );
}
