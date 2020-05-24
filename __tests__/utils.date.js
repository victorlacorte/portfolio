describe('src/utils/date', () => {
  it('parse', () => {
    const date = new Date('2020/4/24');
    const expected = {
      year: 2020,
      month: 4,
      day: 24,
    };

    expect(dist.DateUtils.parse(date)).toEqual(expected);
  });

  it('filterDates', () => {
    const dates = [
      new Date('2020/01/01'),
      new Date('2020/01/20'),
      new Date('2020/02/01'),
      new Date('2020/02/20'),
      new Date('2020/03/01'),
      new Date('2020/03/20'),
    ];

    const inputs = [
      [2020, 1, dates, [new Date('2020/01/01'), new Date('2020/01/20')]],
      [
        2020,
        2,
        dates,
        [
          new Date('2020/01/01'),
          new Date('2020/01/20'),
          new Date('2020/02/01'),
          new Date('2020/02/20'),
        ],
      ],
      [2020, 3, dates, dates],
    ];

    inputs.forEach(([year, month, dates, expected]) => {
      expect(dist.DateUtils.filterDates(year, month, dates)).toEqual(expected);
    });
  });

  it('sanitizeCol', () => {
    const inputs = [
      [
        [1, 2, , , 3, 4],
        [1, 2, 3, 4],
      ],
      [
        [1, , 2, 0],
        [1, 2, 0],
      ],
    ];

    inputs.forEach(([namedRangeCol, expected]) => {
      expect(dist.NamedRangeUtils.sanitizeCol(namedRangeCol)).toEqual(expected);
    });
  });
});
