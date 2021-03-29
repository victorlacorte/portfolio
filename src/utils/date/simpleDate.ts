import { padStart } from 'src/utils/number';
import type { DateBase, SimpleDate as _SimpleDate } from 'src/types';

import { validate } from './helpers';

/**
 * YYYY/MM/DD convention
 */
export default class SimpleDate implements _SimpleDate {
  static make({ year, month, day }: DateBase): _SimpleDate;
  static make(year: number, month: number, day: number): _SimpleDate;
  static make(
    dateBaseOrYear: DateBase | number,
    month?: number,
    day?: number,
  ): _SimpleDate {
    if (typeof dateBaseOrYear === 'number') {
      return validate(new this(dateBaseOrYear, month, day));
    } else {
      const { year, month, day } = dateBaseOrYear;

      return validate(new this(year, month, day));
    }
  }

  private constructor(
    private readonly _year: number,
    private readonly _month: number,
    private readonly _day: number,
  ) {}

  static fromJSDate(d: Date): SimpleDate {
    return new this(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  }

  get year(): number {
    return this._year;
  }

  get month(): number {
    return this._month;
  }

  get day(): number {
    return this._day;
  }

  toJSDate(): Date {
    return new Date(this.year, this.month - 1, this.day);
  }

  toJSON(): DateBase {
    return { year: this.year, month: this.month, day: this.day };
  }

  toString(): string {
    const y = this.year,
      m = padStart(this.month, 2),
      d = padStart(this.day, 2);

    return `${y}/${m}/${d}`;
  }
}
