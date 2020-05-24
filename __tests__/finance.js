describe('src/finance', () => {
  it('validateOp', () => {
    dist.Constants.validOperations.forEach((op) => {
      expect(() => {
        dist.Finance.validateOp(op);
      }).not.toThrow();
    });

    ['C', 'D', 'foo', 1, 0, null, undefined].forEach((op) => {
      expect(() => {
        dist.Finance.validateOp(op);
      }).toThrow();
    });
  });

  describe('statsFrom', () => {
    it('Happy flow', () => {
      const mocked = jest.fn();

      let year = 2020,
        month = 2,
        dates = ['2020/02/01', '2020/02/03', '2020/02/04'].map(
          (date) => new Date(date),
        ),
        tickers = ['t1', 't1', 't1'],
        operations = ['D', 'D', 'D'],
        quantities = [100, 100, 100],
        totals = [100, 100, 100];

      const stats = {
        year,
        month,
        dates,
        tickers,
        operations,
        quantities,
        totals,
        onSell: mocked,
      };

      expect(dist.Finance.statsFrom(stats)).toMatchInlineSnapshot(`
        Object {
          "t1": Object {
            "purchased": Object {
              "qty": 300,
              "total": 300,
            },
            "sold": Object {
              "qty": 0,
              "total": 0,
            },
          },
        }
      `);

      expect(mocked).not.toHaveBeenCalled();

      operations = ['D', 'D', 'C'];

      expect(dist.Finance.statsFrom({ ...stats, operations }))
        .toMatchInlineSnapshot(`
        Object {
          "t1": Object {
            "purchased": Object {
              "qty": 200,
              "total": 200,
            },
            "sold": Object {
              "qty": 100,
              "total": 100,
            },
          },
        }
      `);

      expect(mocked).toHaveBeenCalledTimes(1);
    });
  });
});
