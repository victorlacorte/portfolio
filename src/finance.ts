namespace Finance {
  // TODO we could enforce some format e.g. /^\[a-z]{4}\d$/g
  export function validateTicker(ticker: string, line?: number): void {
    if (typeof ticker !== 'string') {
      throw Constants.genericError('string', ticker, line);
    }
  }

  export function validateOp(op: string, line?: number): void {
    const validCurrOp = Constants.validOperations.some(
      (opType) => op === opType,
    );

    if (!validCurrOp) {
      throw Constants.genericError(
        `either [${Constants.validOperations.toString()}]`,
        op,
        line,
      );
    }
  }

  export function validateQty(qty: number, line?: number): void {
    if (typeof qty !== 'number' && qty > 0) {
      throw Constants.genericError('number', qty, line);
    }
  }

  export function validateTotal(total: number, line?: number): void {
    if (typeof total !== 'number' && total > 0) {
      throw Constants.genericError('number', total, line);
    }
  }

  export function validateMonth(month: number, line?: number): void {
    if (month < 1 || month > 12) {
      throw Constants.genericError('a number in [1, 12]', month, line);
    }
  }

  // TODO document
  export function statsFrom({
    year,
    month,
    dates,
    tickers,
    operations,
    quantities,
    totals,
    onSell = () => {},
  }: {
    year: number;
    month: number;
    dates: Date[];
    tickers: string[];
    operations: string[];
    quantities: number[];
    totals: number[];
    onSell?: Function;
  }): Types.Stats {
    const sanitizedDates = DateUtils.filterDates(year, month, dates),
      stats: Types.Stats = {};

    ArrayUtils.indicesOfSorted(sanitizedDates).forEach((dateIdx) => {
      const currTicker = tickers[dateIdx].toLowerCase();
      validateTicker(currTicker, dateIdx + 1);

      const currOp = operations[dateIdx].toLowerCase();
      validateOp(currOp, dateIdx + 1);

      const currQty = quantities[dateIdx];
      validateQty(currQty, dateIdx + 1);

      const currTotal = totals[dateIdx];
      validateTotal(currTotal, dateIdx + 1);

      if (!(currTicker in stats)) {
        stats[currTicker] = {
          purchased: {
            qty: 0,
            total: 0,
          },
          sold: {
            qty: 0,
            total: 0,
          },
        };
      }

      if (currOp === Constants.ssOperations.buy) {
        stats[currTicker].purchased.qty += currQty;
        stats[currTicker].purchased.total = NumberUtils.add(
          stats[currTicker].purchased.total,
          currTotal,
        );
      } else if (currOp === Constants.ssOperations.sell) {
        if (
          !Object.prototype.hasOwnProperty.call(stats, currTicker) ||
          currQty > stats[currTicker].purchased.qty
        ) {
          throw new Error(Constants.messages.invalidSellQty);
        }

        stats[currTicker].sold.qty += currQty;
        stats[currTicker].sold.total = NumberUtils.add(
          stats[currTicker].sold.total,
          currTotal,
        );

        onSell(stats, dateIdx);

        if (stats[currTicker].purchased.qty == stats[currTicker].sold.qty) {
          delete stats[currTicker];
        }
      }
    });

    return stats;
  }
}
