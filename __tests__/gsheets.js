describe('src/gsheets', () => {
  it('snapshot', () => {
    const tickers = ['foo1', 'foo1'];
    const ops = ['D', 'D'];
    const qtties = [100, 100];
    const totals = [100, 100];

    let year = 2020;
    let month = 2;
    const dates = ['01/02/2020', '01/01/2020', , , , ,];

    expect(dist.snapshot(year, month, dates, tickers, ops, qtties, totals))
      .toMatchInlineSnapshot(`
      Array [
        Array [
          "Ticker",
          "Purchased qty.",
          "Purchased total",
          "Sold qty.",
          "Sold total",
          "Avg. price",
        ],
        Array [
          "foo1",
          200,
          200,
          0,
          0,
          1,
        ],
      ]
    `);

    year = 2019;

    expect(() => {
      dist.snapshot(year, month, dates, tickers, ops, qtties, totals);
    }).toThrow();
  });

  describe('profit', () => {
    it('Happy flow: amount sold <= amount bought', () => {
      const dates = ['2019/12/01', '2019/12/02', '2019/12/03'].map(
          (date) => new Date(date),
        ),
        tickers = ['t1', 't1', 't1'],
        operations = ['D', 'D', 'C'],
        quantities = [100, 100, 100],
        totals = [100, 100, 150],
        taxDeductions = [0, 0, 1];

      const year = 2019;
      const month = 12;

      expect(
        dist.profit(
          year,
          month,
          dates,
          tickers,
          operations,
          quantities,
          totals,
          taxDeductions,
        ),
      ).toMatchInlineSnapshot(`
        Array [
          150,
          50,
          1,
          "2019/12/03: [T1] total=150.00, profit=50.00 (33.33%), tax=1.00",
        ]
      `);
    });
  });
});
