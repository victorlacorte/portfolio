import type { SimpleDate } from 'src/types';

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
export function validate(date: SimpleDate): SimpleDate {
  if (date.toJSDate().getUTCDate() !== date.day) {
    throw new Error(`Invalid date: ${date}`);
  }

  return date;
}
