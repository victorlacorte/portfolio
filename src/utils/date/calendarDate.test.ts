import CalendarDate from './calendarDate';

describe('CalendarDate', () => {
  it('Throws when provided an invalid date', () => {
    expect(() => new CalendarDate(2020, 2, 30)).toThrow();
  });

  it('fromJSDate(x.toJSDate()) === x, x: CalendarDate', () => {
    const dates = [
      { year: 2020, month: 1, day: 1 },
      { year: 2020, month: 1, day: 2 },
      { year: 2020, month: 1, day: 10 },
    ];

    dates.forEach(({ year, month, day }) => {
      const cd = new CalendarDate(year, month, day);
      expect(CalendarDate.fromJSDate(cd.toJSDate())).toEqual(cd);
    });
  });

  it('y = fromJSDate(x), y.toJSDate() === x, x: Date', () => {
    const dates = [
      new Date(2020, 1, 1),
      new Date(2020, 1, 2),
      new Date(2020, 1, 10),
    ];

    dates.forEach((date) => {
      const cd = CalendarDate.fromJSDate(date);
      expect(cd.toJSDate()).toBe(date);
    });
  });

  it('valid', () => {});

  it('toString', () => {});
});
