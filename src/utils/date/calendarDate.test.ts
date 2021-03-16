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
      new Date('2020-01-01T03:00:00.000Z'),
      new Date('2020-01-02T03:00:00.000Z'),
      new Date('2020-01-10T03:00:00.000Z'),
    ];

    dates.forEach((date) => {
      const cd = CalendarDate.fromJSDate(date);
      expect(cd.toJSDate()).toStrictEqual(date);
    });
  });

  it('valid', () => {});

  it('toString', () => {});
});
