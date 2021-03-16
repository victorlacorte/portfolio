import { padStart } from 'src/utils/number';
import type { CalendarDate as _CalendarDate } from 'src/types';

/**
 * YYYY/MM/DD convention
 */
export default class CalendarDate implements _CalendarDate {
  private readonly _year: number;
  private readonly _month: number;
  private readonly _day: number;

  constructor(year: number, month: number, day: number) {
    this._year = year;
    this._month = month;
    this._day = day;

    if (!this.valid()) {
      throw new Error(`Invalid date: ${this}`);
    }
  }

  static fromJSDate(d: Date): CalendarDate {
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

  /**
   * [Dates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
   * are "too smart" and will convert invalid dates to valid ones e.g.
   *
   * const d = new Date(2020, 1, 30); // invalid date: february 30th does not exist
   * d.getUTCDate() // 1
   * d.getUTCMonth() // 2 i.e. march
   *
   * This behavior might not be desired hence this function exists to validate
   * calendar dates.
   */
  valid(): boolean {
    if (this.toJSDate().getUTCDate() !== this.day) {
      return false;
    }

    return true;
  }

  toJSON(): string {
    return this.toString();
  }

  toString(): string {
    const y = this.year,
      m = padStart(this.month, 2),
      d = padStart(this.day, 2);

    return `${y}/${m}/${d}`;
  }
}
