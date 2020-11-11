import { NumberUtils } from 'src/utils/number';
import { Messages } from 'src/utils/messages';
import { Types } from 'src/utils/types';

export namespace Finance {
  export class Portfolio implements Types.Portfolio {
    private readonly _stats: Types.Stats = {};
    private readonly _onPurchase: Types.OperationCallback;
    private readonly _onSell: Types.OperationCallback;

    constructor(onPurchase: Types.OperationCallback, onSell: Types.OperationCallback) {
      this._onPurchase = onPurchase;
      this._onSell = onSell;
    }

    get stats(): Types.Stats {
      return this._stats;
    }

    get onPurchase(): Types.OperationCallback {
      return this._onPurchase;
    }

    get onSell(): Types.OperationCallback {
      return this._onSell;
    }

    add(t: Types.Transaction): void {
      if (t.operation === 'buy') {
        this.addBuyTransaction(t);
      } else if (t.operation === 'sell') {
        this.addSellTransaction(t);
      }
    }

    // We don't call NumberUtils.add when dealing with integer amounts e.g. purchased or sold quantities
    private addBuyTransaction(t: Types.Transaction): void {
      const { ticker, quantity, total } = t;

      if (!Object.prototype.hasOwnProperty.call(this.stats, ticker)) {
        this.stats[ticker] = {
          purchased: {
            qty: 0,
            total: 0,
          },
          sold: {
            qty: 0,
            total: 0,
          },
          averagePrice: 0,
        };
      }

      if (!this.stats[ticker].averagePrice) {
        this.stats[ticker].averagePrice = NumberUtils.div(total, quantity);
      } else {
        const currentQty = this.stats[ticker].purchased.qty - this.stats[ticker].sold.qty;
        const currentValue = NumberUtils.mul(this.stats[ticker].averagePrice, currentQty);

        this.stats[ticker].averagePrice = NumberUtils.div(
          NumberUtils.add(currentValue, total),
          currentQty + quantity,
        );
      }

      this.stats[ticker].purchased.qty += quantity;
      this.stats[ticker].purchased.total = NumberUtils.add(
        this.stats[ticker].purchased.total,
        total,
      );

      this.onPurchase(t, this.stats);
    }

    // TODO is it really necessary to delete closed positions?
    private addSellTransaction(t: Types.Transaction): void {
      const { ticker, quantity, total } = t;
      if (
        !Object.prototype.hasOwnProperty.call(this.stats, ticker) ||
        quantity > this.stats[ticker].purchased.qty
      ) {
        throw new Error(Messages.invalidSellQty);
      }

      this.stats[ticker].sold.qty += quantity;
      this.stats[ticker].sold.total = NumberUtils.add(this.stats[ticker].sold.total, total);

      this.onSell(t, this.stats);

      if (this.stats[ticker].purchased.qty == this.stats[ticker].sold.qty) {
        delete this.stats[ticker];
      }
    }

    toString(): string {
      return JSON.stringify(this.stats);
    }
  }

  /**
   * `Total` might be zero as a side effect to include `buy` operations that
   * represent stock dividends (i.e. an increase in the position for no cost),
   * but `quantity` seems to be strictly positive.
   */
  export class Transaction implements Types.Transaction {
    private readonly _date: Types.CalendarDate;
    private readonly _ticker: string;
    private readonly _operation: Types.Operation;
    private readonly _quantity: number;
    private readonly _total: number;
    private readonly _taxDeduction: number;

    constructor({ date, ticker, operation, quantity, total, taxDeduction }: Types.Transaction) {
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(Messages.expectedPostive(quantity));
      }

      if (total < 0) {
        throw new Error(Messages.expectedPostiveOrZero(total));
      }

      if (isFinite(taxDeduction) && taxDeduction < 0) {
        throw new Error(Messages.expectedPostiveOrZero(taxDeduction));
      }

      this._date = date;
      this._ticker = ticker.toLowerCase();
      this._operation = operation.toLowerCase() as Types.Operation;
      this._quantity = quantity;
      this._total = total;
      this._taxDeduction = taxDeduction || 0;
    }

    get date(): Types.CalendarDate {
      return this._date;
    }

    get ticker(): string {
      return this._ticker;
    }

    get operation(): Types.Operation {
      return this._operation;
    }

    get quantity(): number {
      return this._quantity;
    }

    get total(): number {
      return this._total;
    }

    get taxDeduction(): number {
      return this._taxDeduction;
    }

    toJSON(): Types.Transaction {
      return {
        date: this.date,
        ticker: this.ticker,
        operation: this.operation,
        quantity: this.quantity,
        total: this.total,
        taxDeduction: this.taxDeduction,
      };
    }

    toString(): string {
      return JSON.stringify(this.toJSON());
    }
  }

  export function statsFrom({
    startDate,
    endDate,
    transactions,
    onPurchase = () => {},
    onSell = () => {},
  }: {
    startDate: Types.CalendarDate;
    endDate: Types.CalendarDate;
    transactions: Transaction[];
    onPurchase?: Types.OperationCallback;
    onSell?: Types.OperationCallback;
  }): Types.Stats {
    const start = startDate.toJSDate();
    const end = endDate.toJSDate();

    const p = new Portfolio(onPurchase, onSell);

    transactions
      .filter((t) => t.date.toJSDate() >= start && t.date.toJSDate() <= end)
      .sort((t1, t2) => Number(t1.date.toJSDate()) - Number(t2.date.toJSDate()))
      .forEach((t) => {
        p.add(t);
      });

    return p.stats;
  }
}
