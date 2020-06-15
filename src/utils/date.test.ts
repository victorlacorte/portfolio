import { DateUtils } from './date';

describe('CalendarDate', () => {
  it('Throws when provided an invalid date', () => {
    expect(() => new DateUtils.CalendarDate(2020, 2, 30)).toThrow();
  });

  it('fromJSDate(x.toJSDate()) === x, x: CalendarDate', () => {
    const dates = [
      { year: 2020, month: 1, day: 1 },
      { year: 2020, month: 1, day: 2 },
      { year: 2020, month: 1, day: 10 },
    ];

    dates.forEach(({ year, month, day }) => {
      const cd = new DateUtils.CalendarDate(year, month, day);
      expect(DateUtils.CalendarDate.fromJSDate(cd.toJSDate())).toEqual(cd);
    });
  });

  it('y = fromJSDate(x), y.toJSDate() === x, x: Date', () => {
    const dates = [];

    dates.forEach((date) => {
      const cd = DateUtils.CalendarDate.fromJSDate(date);
      expect(cd.toJSDate()).toBe(date);
    });
  });

  it('valid', () => {});

  it('toString', () => {});
});

describe('daysIn', () => {
  it('Behaves as expected', () => {
    const testCases = [
      { year: 2000, month: 1, days: 31 },
      // 2000 % 400 == 0
      { year: 2000, month: 2, days: 29 },
      { year: 2000, month: 3, days: 31 },
      { year: 2000, month: 4, days: 30 },
      { year: 2000, month: 5, days: 31 },
      { year: 2000, month: 6, days: 30 },
      { year: 2000, month: 7, days: 31 },
      { year: 2000, month: 8, days: 31 },
      { year: 2000, month: 9, days: 30 },
      { year: 2000, month: 10, days: 31 },
      { year: 2000, month: 11, days: 30 },
      { year: 2000, month: 12, days: 31 },
      { year: 2001, month: 2, days: 28 },
      // (2020 % 4 == 0) && (2020 % 100 != 0)
      { year: 2020, month: 2, days: 29 },
    ];

    testCases.forEach(({ year, month, days }) => {
      expect(DateUtils.daysIn(year, month)).toBe(days);
    });
  });
});
