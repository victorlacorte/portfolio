import type { SimpleDate as _SimpleDate } from 'src/types';

import { padStart } from '../number';

import { validate } from './helpers';

export type YMD = Pick<_SimpleDate, 'year' | 'month' | 'day'>;

export default class SimpleDate implements _SimpleDate {
  static make({ year, month, day }: YMD): _SimpleDate;
  static make(year: number, month: number, day: number): _SimpleDate;
  static make(
    fullDateOrYear: YMD | number,
    month?: number,
    day?: number,
  ): _SimpleDate {
    if (typeof fullDateOrYear === 'number') {
      return validate(new this(fullDateOrYear, month, day));
    } else {
      const { year, month, day } = fullDateOrYear;

      return validate(new this(year, month, day));
    }
  }

  private constructor(
    private readonly _year: number,
    private readonly _month: number,
    private readonly _day: number,
  ) {}

  static fromJSDate(d: Date): _SimpleDate {
    return SimpleDate.make(
      d.getUTCFullYear(),
      d.getUTCMonth() + 1,
      d.getUTCDate(),
    );
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

  equals(s: SimpleDate): boolean {
    return this.day == s.day && this.month == s.month && this.year == s.year;
  }

  toJSDate(): Date {
    return new Date(this.year, this.month - 1, this.day);
  }

  toJSON(): string {
    return this.toString();
  }

  toString(): string {
    const y = this.year;
    const m = padStart(this.month, 2);
    const d = padStart(this.day, 2);

    return `${y}/${m}/${d}`;
  }
}
