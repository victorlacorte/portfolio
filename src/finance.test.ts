import { DateUtils } from 'src/utils/date';
import { Types } from 'src/utils/types';

import { Finance } from './finance';

describe('Transaction', () => {
  it('Throws when expected', () => {
    const testCases = [
      {
        // Happy flow
        date: new DateUtils.CalendarDate(2020, 1, 1),
        ticker: 'foo1',
        operation: 'buy' as Types.Operation,
        quantity: 100,
        total: 1000,
        shouldThrow: false,
      },
      {
        // Invalid quantity
        date: new DateUtils.CalendarDate(2020, 1, 1),
        ticker: 'foo1',
        operation: 'buy' as Types.Operation,
        quantity: 0,
        total: 1000,
        shouldThrow: true,
      },
      {
        // Invalid total
        date: new DateUtils.CalendarDate(2020, 1, 1),
        ticker: 'foo1',
        operation: 'buy' as Types.Operation,
        quantity: 100,
        total: -1,
        shouldThrow: true,
      },
    ];

    testCases.forEach(({ shouldThrow, ...t }) => {
      if (shouldThrow) {
        expect(() => new Finance.Transaction(t)).toThrow();
      } else {
        expect(() => new Finance.Transaction(t)).not.toThrow();
      }
    });
  });
});

describe('statsFrom', () => {
  test('A single buy transaction', () => {
    const args = {
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker: 'foo1',
          operation: 'buy' as Types.Operation,
          quantity: 100,
          total: 1000,
        }),
      ],
      startDate: new DateUtils.CalendarDate(2020, 1, 1),
      endDate: new DateUtils.CalendarDate(2020, 1, 1),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    expect(Finance.statsFrom(args)).toMatchInlineSnapshot(`
      Object {
        "foo1": Object {
          "purchased": Object {
            "qty": 100,
            "total": 1000,
          },
          "sold": Object {
            "qty": 0,
            "total": 0,
          },
        },
      }
    `);

    expect(args.onPurchase).toHaveBeenCalledTimes(1);
    expect(args.onSell).not.toHaveBeenCalled();
  });

  test('A couple of buy transactions', () => {
    const args = {
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker: 'foo1',
          operation: 'buy' as Types.Operation,
          quantity: 100,
          total: 1000,
        }),
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 2),
          ticker: 'foo1',
          operation: 'buy' as Types.Operation,
          quantity: 100,
          total: 1000,
        }),
      ],
      startDate: new DateUtils.CalendarDate(2020, 1, 1),
      endDate: new DateUtils.CalendarDate(2020, 1, 2),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    expect(Finance.statsFrom(args)).toMatchInlineSnapshot(`
      Object {
        "foo1": Object {
          "purchased": Object {
            "qty": 200,
            "total": 2000,
          },
          "sold": Object {
            "qty": 0,
            "total": 0,
          },
        },
      }
    `);

    expect(args.onPurchase).toHaveBeenCalledTimes(2);
    expect(args.onSell).not.toHaveBeenCalled();
  });

  test('Buy and sell transactions', () => {
    const args = {
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker: 'foo1',
          operation: 'buy' as Types.Operation,
          quantity: 100,
          total: 1000,
        }),
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 2),
          ticker: 'foo1',
          operation: 'sell' as Types.Operation,
          quantity: 100,
          total: 1000,
        }),
      ],
      startDate: new DateUtils.CalendarDate(2020, 1, 1),
      endDate: new DateUtils.CalendarDate(2020, 1, 2),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    expect(Finance.statsFrom(args)).toMatchInlineSnapshot(`Object {}`);

    expect(args.onPurchase).toHaveBeenCalledTimes(1);
    expect(args.onSell).toHaveBeenCalledTimes(1);
  });

  test('Attempt to sell before buying', () => {
    const args = {
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 2),
          ticker: 'foo1',
          operation: 'buy' as Types.Operation,
          quantity: 100,
          total: 1000,
        }),
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker: 'foo1',
          operation: 'sell' as Types.Operation,
          quantity: 100,
          total: 1000,
        }),
      ],
      startDate: new DateUtils.CalendarDate(2020, 1, 1),
      endDate: new DateUtils.CalendarDate(2020, 1, 2),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    expect(() => Finance.statsFrom(args)).toThrow();

    expect(args.onPurchase).not.toHaveBeenCalled();
    expect(args.onSell).not.toHaveBeenCalled();
  });

  test('Attempt to sell an invalid quantity', () => {
    const args = {
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker: 'foo1',
          operation: 'buy' as Types.Operation,
          quantity: 100,
          total: 1000,
        }),
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 2),
          ticker: 'foo1',
          operation: 'sell' as Types.Operation,
          quantity: 200,
          total: 1000,
        }),
      ],
      startDate: new DateUtils.CalendarDate(2020, 1, 1),
      endDate: new DateUtils.CalendarDate(2020, 1, 2),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    expect(() => Finance.statsFrom(args)).toThrow();

    expect(args.onPurchase).toHaveBeenCalledTimes(1);
    expect(args.onSell).not.toHaveBeenCalled();
  });

  test('Attempt to sell a ticker absent from the portfolio', () => {
    const args = {
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker: 'foo1',
          operation: 'buy' as Types.Operation,
          quantity: 100,
          total: 1000,
        }),
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 2),
          ticker: 'foo2',
          operation: 'sell' as Types.Operation,
          quantity: 100,
          total: 1000,
        }),
      ],
      startDate: new DateUtils.CalendarDate(2020, 1, 1),
      endDate: new DateUtils.CalendarDate(2020, 1, 2),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    expect(() => Finance.statsFrom(args)).toThrow();

    expect(args.onPurchase).toHaveBeenCalledTimes(1);
    expect(args.onSell).not.toHaveBeenCalled();
  });

  test('Exclude a transaction from the date range', () => {
    const args = {
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker: 'foo1',
          operation: 'buy' as Types.Operation,
          quantity: 100,
          total: 1000,
        }),
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 2),
          ticker: 'foo1',
          operation: 'sell' as Types.Operation,
          quantity: 100,
          total: 1000,
        }),
      ],
      startDate: new DateUtils.CalendarDate(2020, 1, 1),
      endDate: new DateUtils.CalendarDate(2020, 1, 1),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    expect(Finance.statsFrom(args)).toMatchInlineSnapshot(`
      Object {
        "foo1": Object {
          "purchased": Object {
            "qty": 100,
            "total": 1000,
          },
          "sold": Object {
            "qty": 0,
            "total": 0,
          },
        },
      }
    `);

    expect(args.onPurchase).toHaveBeenCalledTimes(1);
    expect(args.onSell).not.toHaveBeenCalled();
  });

  test('Exclude all transactions from the date range', () => {
    const args = {
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker: 'foo1',
          operation: 'buy' as Types.Operation,
          quantity: 100,
          total: 1000,
        }),
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 2),
          ticker: 'foo1',
          operation: 'sell' as Types.Operation,
          quantity: 100,
          total: 1000,
        }),
      ],
      startDate: new DateUtils.CalendarDate(2020, 1, 3),
      endDate: new DateUtils.CalendarDate(2020, 1, 3),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    expect(Finance.statsFrom(args)).toMatchInlineSnapshot(`Object {}`);

    expect(args.onPurchase).not.toHaveBeenCalled();
    expect(args.onSell).not.toHaveBeenCalled();
  });
});
