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

    for (const d of dates) {
      const sd = SimpleDate.make(d);

      expect(SimpleDate.fromJSDate(sd.toJSDate())).toEqual(sd);
    }
  });

  test('y = fromJSDate(x), y.toJSDate() === x, x: Date', () => {
    const dates = [
      new Date('2020-01-01T03:00:00.000Z'),
      new Date('2020-01-02T03:00:00.000Z'),
      new Date('2020-01-10T03:00:00.000Z'),
    ];

    for (const date of dates) {
      const cd = SimpleDate.fromJSDate(date);

      expect(cd.toJSDate()).toStrictEqual(date);
    }
  });

  test('toString', () => {
    const d = SimpleDate.make(2020, 2, 1);
    const expected = '2020/02/01';

    expect(d.toString()).toBe(expected);
    expect(`${d}`).toBe(expected);
  });

  test('equals', () => {
    const s1 = SimpleDate.make(2020, 1, 1);
    const s2 = SimpleDate.make(2020, 1, 1);
    const s3 = SimpleDate.make(2020, 1, 2);

    expect(s1.equals(s1)).toBe(true);
    expect(s1.equals(s2)).toBe(true);
    expect(s1.equals(s3)).toBe(false);
  });
});
