import SimpleDate from './simpleDate';
import type { YMD } from './simpleDate';

describe('SimpleDate', () => {
  test('Throws when provided an invalid date', () => {
    expect(() => SimpleDate.make({ year: 2020, month: 2, day: 30 })).toThrow();
  });

  test('fromJSDate(x.toJSDate()) === x, x: SimpleDate', () => {
    const dates: YMD[] = [
      { year: 2020, month: 1, day: 1 },
      { year: 2020, month: 1, day: 2 },
      { year: 2020, month: 1, day: 10 },
    ];

    dates.forEach((d) => {
      const sd = SimpleDate.make(d);

      expect(SimpleDate.fromJSDate(sd.toJSDate())).toEqual(sd);
    });
  });

  test('y = fromJSDate(x), y.toJSDate() === x, x: Date', () => {
    const dates = [
      new Date('2020-01-01T03:00:00.000Z'),
      new Date('2020-01-02T03:00:00.000Z'),
      new Date('2020-01-10T03:00:00.000Z'),
    ];

    dates.forEach((date) => {
      const cd = SimpleDate.fromJSDate(date);

      expect(cd.toJSDate()).toStrictEqual(date);
    });
  });

  test('toString', () => {
    expect(SimpleDate.make(2020, 2, 1).toString()).toBe('2020/02/01');
  });
});
