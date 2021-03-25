import faker from 'faker';

import { statsFrom } from 'src/finance';

import { CalendarDate } from '../utils/date';
import {
  irpfHelper,
  makeTransactions,
  profit,
  sameLength,
  sanitizeDates,
  sanitizeNumbers,
  sanitizeOperations,
  sanitizeSparseMatrix,
  sanitizeTickers,
  snapshot,
} from './helpers';

describe('Sheets helpers', () => {
  test('sanitizeSparseMatrix', () => {
    expect(sanitizeSparseMatrix([[1], [2], , ,])).toEqual([1, 2]);
    expect(sanitizeSparseMatrix([[1], [2], , [3]])).toEqual([1, 2, 3]);
    expect(sanitizeSparseMatrix([['a'], ['b'], , ['c'], ['']])).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  test('sameLength', () => {
    expect(sameLength([1, 2], [3, 4])).toBe(true);
    expect(sameLength([1, 2], [])).toBe(false);
    expect(sameLength([1, 2], [3])).toBe(false);
  });

  describe('makeTransactions', () => {
    test('Creates a single transaction', () => {
      const t = makeTransactions({
        dates: [[new Date(2020, 0, 1)]],
        tickers: [['foo1']],
        operations: [['buy']],
        quantities: [[100]],
        totals: [[1000]],
        taxDeductions: [[0]],
      });

      expect(JSON.parse(JSON.stringify(t))).toMatchInlineSnapshot(`
        Array [
          Object {
            "date": "2020/01/01",
            "operation": "buy",
            "quantity": 100,
            "taxDeduction": 0,
            "ticker": "foo1",
            "total": 1000,
          },
        ]
      `);
    });

    test("Throws an exception when arrays don't have the same size", () => {
      const t = {
        dates: [[new Date(2020, 0, 1)], [new Date(2020, 0, 2)]],
        tickers: [['foo1']],
        operations: [['buy'], ['sell']],
        quantities: [[100], [100]],
        totals: [[1000], [1000]],
        taxDeductions: [[0], [1]],
      };

      expect(() => makeTransactions(t)).toThrow();
    });

    test('Creates two transactions', () => {
      const t = makeTransactions({
        dates: [[new Date(2020, 0, 1)], [new Date(2020, 0, 2)]],
        tickers: [['foo1'], ['foo1']],
        operations: [['buy'], ['sell']],
        quantities: [[100], [100]],
        totals: [[1000], [1000]],
        taxDeductions: [[0], [1]],
      });

      expect(t.map((entry) => JSON.parse(String(entry))))
        .toMatchInlineSnapshot(`
        Array [
          Object {
            "date": "2020/01/01",
            "operation": "buy",
            "quantity": 100,
            "taxDeduction": 0,
            "ticker": "foo1",
            "total": 1000,
          },
          Object {
            "date": "2020/01/02",
            "operation": "sell",
            "quantity": 100,
            "taxDeduction": 1,
            "ticker": "foo1",
            "total": 1000,
          },
        ]
      `);
    });

    test('Creates transactions without taxDeductions', () => {
      const t = makeTransactions({
        dates: [[new Date(2020, 0, 1)], [new Date(2020, 0, 2)]],
        tickers: [['foo1'], ['foo1']],
        operations: [['buy'], ['buy']],
        quantities: [[100], [100]],
        totals: [[1000], [1000]],
      });

      expect(t.map((entry) => JSON.parse(String(entry))))
        .toMatchInlineSnapshot(`
        Array [
          Object {
            "date": "2020/01/01",
            "operation": "buy",
            "quantity": 100,
            "taxDeduction": 0,
            "ticker": "foo1",
            "total": 1000,
          },
          Object {
            "date": "2020/01/02",
            "operation": "buy",
            "quantity": 100,
            "taxDeduction": 0,
            "ticker": "foo1",
            "total": 1000,
          },
        ]
      `);
    });
  });

  test('sanitizeDates', () => {
    expect(
      sanitizeDates([[new Date(2020, 0, 1)], [new Date(2020, 0, 1)], , ,]),
    ).toEqual([new CalendarDate(2020, 1, 1), new CalendarDate(2020, 1, 1)]);
  });

  test('sanitizeTickers', () => {
    expect(sanitizeTickers([['foo1'], ['foo2'], ,])).toEqual(['foo1', 'foo2']);
  });

  test('sanitizeOperations', () => {
    expect(sanitizeOperations([['buy'], ['sell'], ,])).toEqual(['buy', 'sell']);
    expect(() => sanitizeOperations([['buy'], ['foo'], ,])).toThrow();
  });

  test('sanitizeNumbers', () => {
    expect(sanitizeNumbers([[1], [2], [0]])).toEqual([1, 2, 0]);
    expect(sanitizeNumbers([[100.0], [1000.23], ,])).toEqual([100, 1000.23]);
    // We need to "trick" the number conversion otherwise we get type checked and our test won't throw
    expect(() => sanitizeNumbers([[1], [Number('foo')], ,])).toThrow();
  });

  describe('profit', () => {
    test('A single buy transaction, so no profit', () => {
      const stats = {
        startDate: new CalendarDate(2020, 1, 1),
        endDate: new CalendarDate(2020, 1, 1),
        dates: [[new Date(2020, 0, 1)]],
        tickers: [['foo1']],
        operations: [['buy']],
        quantities: [[100]],
        totals: [[1000]],
        taxDeductions: [[0]],
      };

      expect(profit(stats)).toMatchInlineSnapshot(`
        Object {
          "log": "",
          "profit": 0,
          "taxDeduction": 0,
          "total": 0,
        }
      `);
    });

    test('A couple of buy transactions, so no profit', () => {
      const stats = {
        startDate: new CalendarDate(2020, 1, 1),
        endDate: new CalendarDate(2020, 1, 2),
        dates: [[new Date(2020, 0, 1), new Date(2020, 0, 1)]],
        tickers: [['foo1', 'foo1']],
        operations: [['buy', 'buy']],
        quantities: [[100, 200]],
        totals: [[1000, 1900]],
        taxDeductions: [[0, 0]],
      };

      expect(profit(stats)).toMatchInlineSnapshot(`
        Object {
          "log": "",
          "profit": 0,
          "taxDeduction": 0,
          "total": 0,
        }
      `);
    });

    test('Buy and sell transactions, but 0 profit', () => {
      const stats = {
        startDate: new CalendarDate(2020, 1, 1),
        endDate: new CalendarDate(2020, 1, 2),
        dates: [[new Date(2020, 0, 1), new Date(2020, 0, 1)]],
        tickers: [['foo1', 'foo1']],
        operations: [['buy', 'sell']],
        quantities: [[100, 100]],
        totals: [[1000, 1000]],
        taxDeductions: [[0, 1]],
      };

      expect(profit(stats)).toMatchInlineSnapshot(`
        Object {
          "log": "2020/01/01: [FOO1] quantity=100, total=1,000.00, profit=0.00 (0%), tax=1.00",
          "profit": 0,
          "taxDeduction": 1,
          "total": 1000,
        }
      `);
    });

    test('Buy and sell transactions, with profit', () => {
      const stats = {
        startDate: new CalendarDate(2020, 1, 1),
        endDate: new CalendarDate(2020, 1, 2),
        dates: [[new Date(2020, 0, 1), new Date(2020, 0, 1)]],
        tickers: [['foo1', 'foo1']],
        operations: [['buy', 'sell']],
        quantities: [[100, 100]],
        totals: [[1000, 1100]],
        taxDeductions: [[0, 1]],
      };

      expect(profit(stats)).toMatchInlineSnapshot(`
        Object {
          "log": "2020/01/01: [FOO1] quantity=100, total=1,100.00, profit=100.00 (10%), tax=1.00",
          "profit": 100,
          "taxDeduction": 1,
          "total": 1100,
        }
      `);
    });

    test('Sell transaction with no tax deduction', () => {
      const stats = {
        startDate: new CalendarDate(2020, 1, 1),
        endDate: new CalendarDate(2020, 1, 2),
        dates: [[new Date(2020, 0, 1), new Date(2020, 0, 1)]],
        tickers: [['foo1', 'foo1']],
        operations: [['buy', 'sell']],
        quantities: [[100, 100]],
        totals: [[1000, 1100]],
        taxDeductions: [[0, 0]],
      };

      expect(() => profit(stats)).toThrow();
    });
  });

  describe('snapshot', () => {
    test('Opens a position with a single ticker', () => {
      const stats = {
        startDate: new CalendarDate(2020, 1, 1),
        endDate: new CalendarDate(2020, 1, 1),
        dates: [[new Date(2020, 0, 1)]],
        tickers: [['foo1']],
        operations: [['buy']],
        quantities: [[100]],
        totals: [[1000]],
      };

      expect(snapshot(stats)).toMatchInlineSnapshot(`
        Array [
          Object {
            "averagePrice": 10,
            "log": "2020/01/01: [BUY] 100 stocks for 1,000.00 (10.00)",
            "purchasedQuantity": 100,
            "purchasedTotal": 1000,
            "soldQuantity": 0,
            "soldTotal": 0,
            "ticker": "foo1",
          },
        ]
      `);
    });

    test('Opens a position with different tickers', () => {
      const stats = {
        startDate: new CalendarDate(2020, 1, 1),
        endDate: new CalendarDate(2020, 1, 2),
        dates: [[new Date(2020, 0, 1)], [new Date(2020, 0, 2)]],
        tickers: [['foo1'], ['foo2']],
        operations: [['buy'], ['buy']],
        quantities: [[100], [200]],
        totals: [[1000], [5000]],
      };

      expect(snapshot(stats)).toMatchInlineSnapshot(`
        Array [
          Object {
            "averagePrice": 10,
            "log": "2020/01/01: [BUY] 100 stocks for 1,000.00 (10.00)",
            "purchasedQuantity": 100,
            "purchasedTotal": 1000,
            "soldQuantity": 0,
            "soldTotal": 0,
            "ticker": "foo1",
          },
          Object {
            "averagePrice": 25,
            "log": "2020/01/02: [BUY] 200 stocks for 5,000.00 (25.00)",
            "purchasedQuantity": 200,
            "purchasedTotal": 5000,
            "soldQuantity": 0,
            "soldTotal": 0,
            "ticker": "foo2",
          },
        ]
      `);
    });

    test('Opens and closes a position', () => {
      const stats = {
        startDate: new CalendarDate(2020, 1, 1),
        endDate: new CalendarDate(2020, 1, 2),
        dates: [[new Date(2020, 0, 1)], [new Date(2020, 0, 2)]],
        tickers: [['foo1'], ['foo1']],
        operations: [['buy'], ['sell']],
        quantities: [[100], [100]],
        totals: [[1000], [1100]],
      };

      expect(snapshot(stats)).toMatchInlineSnapshot(`
        Array [
          Object {
            "averagePrice": 0,
            "log": "2020/01/01: [BUY] 100 stocks for 1,000.00 (10.00)
        2020/01/02: [SELL] 100 stocks for 1,100.00 (11.00)",
            "purchasedQuantity": 0,
            "purchasedTotal": 0,
            "soldQuantity": 0,
            "soldTotal": 0,
            "ticker": "foo1",
          },
        ]
      `);
    });

    test('Opens a position with different tickers, then closes one of them', () => {
      const stats = {
        startDate: new CalendarDate(2020, 1, 1),
        endDate: new CalendarDate(2020, 1, 2),
        dates: [
          [new Date(2020, 0, 1)],
          [new Date(2020, 0, 1)],
          [new Date(2020, 0, 2)],
        ],
        tickers: [['foo1'], ['foo2'], ['foo1']],
        operations: [['buy'], ['buy'], ['sell']],
        quantities: [[100], [100], [100]],
        totals: [[1000], [3000], [500]],
      };

      expect(snapshot(stats)).toMatchInlineSnapshot(`
        Array [
          Object {
            "averagePrice": 0,
            "log": "2020/01/01: [BUY] 100 stocks for 1,000.00 (10.00)
        2020/01/02: [SELL] 100 stocks for 500.00 (5.00)",
            "purchasedQuantity": 0,
            "purchasedTotal": 0,
            "soldQuantity": 0,
            "soldTotal": 0,
            "ticker": "foo1",
          },
          Object {
            "averagePrice": 30,
            "log": "2020/01/01: [BUY] 100 stocks for 3,000.00 (30.00)",
            "purchasedQuantity": 100,
            "purchasedTotal": 3000,
            "soldQuantity": 0,
            "soldTotal": 0,
            "ticker": "foo2",
          },
        ]
      `);
    });

    test('Opens and closes a position, then reopens it', () => {
      const stats = {
        startDate: new CalendarDate(2020, 1, 1),
        endDate: new CalendarDate(2020, 1, 3),
        dates: [
          [new Date(2020, 0, 1)],
          [new Date(2020, 0, 2)],
          [new Date(2020, 0, 3)],
        ],
        tickers: [['foo1'], ['foo1'], ['foo1']],
        operations: [['buy'], ['sell'], ['buy']],
        quantities: [[100], [100], [1000]],
        totals: [[1000], [1100], [20000]],
      };

      expect(snapshot(stats)).toMatchInlineSnapshot(`
        Array [
          Object {
            "averagePrice": 20,
            "log": "2020/01/01: [BUY] 100 stocks for 1,000.00 (10.00)
        2020/01/02: [SELL] 100 stocks for 1,100.00 (11.00)
        2020/01/03: [BUY] 1000 stocks for 20,000.00 (20.00)",
            "purchasedQuantity": 1000,
            "purchasedTotal": 20000,
            "soldQuantity": 0,
            "soldTotal": 0,
            "ticker": "foo1",
          },
        ]
      `);
    });
  });

  describe('irpfHelper', () => {
    const baseYear = 2020;
    const ticker = 'foo1';
    const total = 100;

    it('Opens and closes a position N years before `baseYear`', () => {
      const stats = {
        baseYear,
        tickers: [[ticker, ticker]],
        operations: [['buy', 'sell']],
        quantities: [[100, 100]],
        totals: [[total, total]],
      };

      for (let i = 2; i > 0; i--) {
        const dates = [
          [new Date(baseYear - i, 1, 1), new Date(baseYear - i, 1, 2)],
        ];
        const currStats = { ...stats, dates };

        expect(irpfHelper(currStats)[ticker].ownedValuePrevYear).toBe(0);
        expect(irpfHelper(currStats)[ticker].ownedValueCurrYear).toBe(0);
      }
    });

    it('Opens a position N years before `baseYear`', () => {
      const stats = {
        baseYear,
        tickers: [[ticker, ticker]],
        operations: [['buy', 'buy']],
        quantities: [[100, 100]],
        totals: [[total, total]],
      };

      for (let i = 2; i > 0; i--) {
        const dates = [
          [new Date(baseYear - i, 1, 1), new Date(baseYear - i, 1, 2)],
        ];
        const currStats = { ...stats, dates };

        expect(irpfHelper(currStats)[ticker].ownedValuePrevYear).toBe(
          total * 2,
        );
        expect(irpfHelper(currStats)[ticker].ownedValueCurrYear).toBe(
          total * 2,
        );
      }
    });

    it('Opens a position a year before `baseYear` and closes it in `baseYear`', () => {
      const stats = {
        baseYear,
        dates: [[new Date(baseYear - 1, 1, 1), new Date(baseYear, 1, 1)]],
        tickers: [[ticker, ticker]],
        operations: [['buy', 'sell']],
        quantities: [[100, 100]],
        totals: [[total, total]],
      };

      expect(irpfHelper(stats)[ticker].ownedValuePrevYear).toBe(total);
      expect(irpfHelper(stats)[ticker].ownedValueCurrYear).toBe(0);
    });

    it('Opens and closes a position a year before `baseYear`, then reopens it in `baseYear`', () => {
      const stats = {
        baseYear,
        dates: [
          [
            new Date(baseYear - 1, 1, 1),
            new Date(baseYear - 1, 1, 2),
            new Date(baseYear, 1, 1),
          ],
        ],
        tickers: [[ticker, ticker, ticker]],
        operations: [['buy', 'sell', 'buy']],
        quantities: [[100, 100, 100]],
        totals: [[total, total, total]],
      };

      expect(irpfHelper(stats)[ticker].ownedValuePrevYear).toBe(0);
      expect(irpfHelper(stats)[ticker].ownedValueCurrYear).toBe(total);
    });

    it('Opens a position a year before `baseYear`, then purchases again in `baseYear`', () => {
      const stats = {
        baseYear,
        dates: [[new Date(baseYear - 1, 1, 1), new Date(baseYear, 1, 1)]],
        tickers: [[ticker, ticker]],
        operations: [['buy', 'buy']],
        quantities: [[100, 100]],
        totals: [[total, total]],
      };

      expect(irpfHelper(stats)[ticker].ownedValuePrevYear).toBe(total);
      expect(irpfHelper(stats)[ticker].ownedValueCurrYear).toBe(total * 2);
    });

    it('Correctly considers the appropriate date interval', () => {
      const stats = {
        baseYear,
        dates: [[new Date(baseYear, 1, 1), new Date(baseYear + 1, 1, 1)]],
        tickers: [[ticker, ticker]],
        operations: [['buy', 'buy']],
        quantities: [[100, 100]],
        totals: [[total, total]],
      };

      expect(irpfHelper(stats)[ticker].ownedValuePrevYear).toBe(0);
      expect(irpfHelper(stats)[ticker].ownedValueCurrYear).toBe(total);
    });
  });
});
