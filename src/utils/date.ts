import { padStart } from 'src/utils/number';
import type { CalendarDate as CalendarDateType } from 'src/utils/types';

/**
 * TODO we could have Month and Day types: would it help, though? We already
 * validate CalendarDates upon construction.
 */
/**
 * YYYY/MM/DD convention
 */
export class CalendarDate implements CalendarDateType {
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

// https://jsperf.com/days-in-month-perf-test/6
// https://www.ecma-international.org/ecma-262/10.0/index.html#eqn-DaysInYear
/**
 * Pay attention to the leaping year definition
 * @param month 1 indexed: 1-12
 */
export function daysIn(year: number, month: number): 28 | 29 | 30 | 31 {
  switch (month) {
    case 2:
      return (year % 4 == 0 && year % 100) || year % 400 == 0 ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}
