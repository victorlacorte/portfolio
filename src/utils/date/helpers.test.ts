import { daysIn } from './helpers';

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
      expect(daysIn(year, month)).toBe(days);
    });
  });
});
