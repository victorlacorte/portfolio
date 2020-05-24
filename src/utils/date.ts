namespace DateUtils {
  export function parse(date: Date): Types.ParsedDate {
    const d = new Date(date);

    return {
      year: d.getUTCFullYear(),
      // getUTCMonth is 0-indexed
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
    };
  }

  // TODO we are forcing the "less than or equal to" comparison. Is this always
  // the case?
  // TODO the exception should not be thrown inside this function, but rather
  // on the validation one
  /**
   * We parse and create a new Date since we want to compare against `year` and `month` only,
   * and the `paramDate` we create will have a day as well.
   *
   * @param year
   * @param month
   * @param dates
   */
  export function filterDates(
    year: number,
    month: number,
    dates: Date[],
    compareFn = (d: Date, base: Date) => d <= base,
  ): Date[] {
    const paramDate = new Date(year, month - 1);

    const relevant = dates.filter((date) => {
      const parsed = parse(new Date(date));
      const currDate = new Date(parsed.year, parsed.month - 1);

      return compareFn(currDate, paramDate);
    });

    if (!relevant.length) {
      throw new Error('No relevant dates provided');
    }

    return relevant;
  }
}
