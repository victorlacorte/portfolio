import faker from 'faker';

import { DateUtils } from 'src/utils/date';
import { NumberUtils } from 'src/utils/number';
import { Types } from 'src/utils/types';

import { Finance } from './finance';

describe('Portfolio', () => {
  test('The averagePrice behaves as expected after successive buy operations', () => {
    // reproducing the example in https://www.bussoladoinvestidor.com.br/calculo-do-preco-medio-de-acoes/
    // 1. 01/01: 9.215
    // 2. 01/02: (9.215*100 + 12.217*100) / 200 = 10.716
    // 3. 01/03: (10.716*200 + 15.118 * 200) / 400 = 12.917

    const ticker = faker.random.word().toLowerCase();
    const noop = (): void => {};

    const portfolio = new Finance.Portfolio(noop, noop);

    portfolio.add(
      new Finance.Transaction({
        date: new DateUtils.CalendarDate(2020, 1, 1),
        ticker,
        operation: 'buy' as Types.Operation,
        quantity: 100,
        total: 921.5,
      }),
    );

    expect(NumberUtils.toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(9.22);

    portfolio.add(
      new Finance.Transaction({
        date: new DateUtils.CalendarDate(2020, 1, 2),
        ticker,
        operation: 'buy' as Types.Operation,
        quantity: 100,
        total: 1221.7,
      }),
    );

    expect(NumberUtils.toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(10.72);

    portfolio.add(
      new Finance.Transaction({
        date: new DateUtils.CalendarDate(2020, 1, 3),
        ticker,
        operation: 'buy' as Types.Operation,
        quantity: 200,
        total: 3023.6,
      }),
    );

    expect(NumberUtils.toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(12.92);
  });

  test('The averagePrice behaves as expected after buy and sell operations', () => {
    // reproducing the example in https://www.bussoladoinvestidor.com.br/calculo-do-preco-medio-de-acoes/
    // 1. 01/01: 9.215
    // 2. 01/02: (9.215*100 + 12.217*100) / 200 = 10.716
    // 3. 01/04: (10.716*150 + 15.118*200) / 350 = 13.231

    const ticker = faker.random.word().toLocaleLowerCase();
    const fn = (): void => {};

    const portfolio = new Finance.Portfolio(fn, fn);

    portfolio.add(
      new Finance.Transaction({
        date: new DateUtils.CalendarDate(2020, 1, 1),
        ticker,
        operation: 'buy' as Types.Operation,
        quantity: 100,
        total: 921.5,
      }),
    );

    expect(NumberUtils.toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(9.22);

    portfolio.add(
      new Finance.Transaction({
        date: new DateUtils.CalendarDate(2020, 1, 2),
        ticker,
        operation: 'buy' as Types.Operation,
        quantity: 100,
        total: 1221.7,
      }),
    );

    expect(NumberUtils.toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(10.72);

    portfolio.add(
      new Finance.Transaction({
        date: new DateUtils.CalendarDate(2020, 1, 3),
        ticker,
        operation: 'sell' as Types.Operation,
        quantity: 50,
        total: faker.random.number(),
      }),
    );

    portfolio.add(
      new Finance.Transaction({
        date: new DateUtils.CalendarDate(2020, 1, 4),
        ticker,
        operation: 'buy' as Types.Operation,
        quantity: 200,
        total: 3023.6,
      }),
    );

    expect(NumberUtils.toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(13.23);
  });
});

describe('Transaction', () => {
  test('Throws when expected', () => {
    // Both ticker and date are not relevant for the tests
    const ticker = faker.random.word().toLowerCase();
    const date = new DateUtils.CalendarDate(2020, 1, 1);

    const validQuantity = faker.random.number({ min: 1 });
    const validTotal = faker.random.number({ min: 1 });

    const invalidQuantity = 0; // any non-positive integer
    const invalidTotal = -1; // any number less than zero

    const testCases = [
      {
        date,
        ticker,
        operation: 'buy' as Types.Operation,
        quantity: validQuantity,
        total: validTotal,
        shouldThrow: false,
      },
      {
        date,
        ticker,
        operation: 'sell' as Types.Operation,
        quantity: validQuantity,
        total: validTotal,
        shouldThrow: false,
      },
      {
        date,
        ticker,
        operation: 'buy' as Types.Operation,
        quantity: invalidQuantity,
        total: validTotal,
        shouldThrow: true,
      },
      {
        date,
        ticker,
        operation: 'sell' as Types.Operation,
        quantity: invalidQuantity,
        total: validTotal,
        shouldThrow: true,
      },
      {
        date,
        ticker,
        operation: 'buy' as Types.Operation,
        quantity: validQuantity,
        total: invalidTotal,
        shouldThrow: true,
      },
      {
        date,
        ticker,
        operation: 'sell' as Types.Operation,
        quantity: validQuantity,
        total: invalidTotal,
        shouldThrow: true,
      },
      {
        date,
        ticker,
        operation: 'buy' as Types.Operation,
        quantity: invalidQuantity,
        total: invalidTotal,
        shouldThrow: true,
      },
      {
        date,
        ticker,
        operation: 'sell' as Types.Operation,
        quantity: invalidQuantity,
        total: invalidTotal,
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
  test('Calls onPurchase for each `buy` transaction, and onSell for each `sell` transaction', () => {
    // Reutilize the same ticker and quantity to be able to sell the purchased amount
    const quantity = faker.random.number({ min: 1 });
    const ticker = faker.random.word().toLowerCase();

    // Total is irrelevant; simply needs to be a valid amount
    const total = faker.random.number({ min: 1 });

    const args = {
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker,
          operation: 'buy' as Types.Operation,
          quantity,
          total,
        }),
      ],
      startDate: new DateUtils.CalendarDate(2020, 1, 1),
      endDate: new DateUtils.CalendarDate(2020, 1, 31),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    Finance.statsFrom(args);

    expect(args.onPurchase).toHaveBeenCalledTimes(1);
    expect(args.onSell).not.toHaveBeenCalled();

    args.onPurchase.mockReset();
    args.onSell.mockReset();

    Finance.statsFrom({
      ...args,
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker,
          operation: 'buy' as Types.Operation,
          quantity,
          total,
        }),
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 2),
          ticker,
          operation: 'buy' as Types.Operation,
          quantity,
          total,
        }),
      ],
    });

    expect(args.onPurchase).toHaveBeenCalledTimes(2);
    expect(args.onSell).not.toHaveBeenCalled();

    args.onPurchase.mockReset();
    args.onSell.mockReset();

    Finance.statsFrom({
      ...args,
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker,
          operation: 'buy' as Types.Operation,
          quantity,
          total,
        }),
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 2),
          ticker,
          operation: 'sell' as Types.Operation,
          quantity,
          total,
        }),
      ],
    });

    expect(args.onPurchase).toHaveBeenCalledTimes(1);
    expect(args.onSell).toHaveBeenCalledTimes(1);
  });

  test('Throw an error by attempting to sell before buying', () => {
    const ticker = faker.random.word().toLowerCase();
    const quantity = faker.random.number({ min: 1 });

    const args = {
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker,
          operation: 'sell' as Types.Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
        }),
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 2),
          ticker,
          operation: 'buy' as Types.Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
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

  test('Throw an error attempting to sell an amount not owned', () => {
    const ticker = faker.random.word().toLowerCase();

    const args = {
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker,
          operation: 'buy' as Types.Operation,
          quantity: 1,
          total: faker.random.number({ min: 1 }),
        }),
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 2),
          ticker,
          operation: 'sell' as Types.Operation,
          quantity: 2,
          total: faker.random.number({ min: 1 }),
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

  test('Throw an error attempting to sell a ticker absent from the portfolio', () => {
    const quantity = faker.random.number({ min: 1 });

    const args = {
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker: 'foo1',
          operation: 'buy' as Types.Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
        }),
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 2),
          ticker: 'foo2',
          operation: 'sell' as Types.Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
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

  test('Do not call onSell since the `sell` transaction is outside the date range', () => {
    const ticker = faker.random.word().toLowerCase();
    const quantity = faker.random.number({ min: 1 });

    const args = {
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker,
          operation: 'buy' as Types.Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
        }),
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 2),
          ticker,
          operation: 'sell' as Types.Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
        }),
      ],
      startDate: new DateUtils.CalendarDate(2020, 1, 1),
      endDate: new DateUtils.CalendarDate(2020, 1, 1),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    Finance.statsFrom(args);

    expect(args.onPurchase).toHaveBeenCalledTimes(1);
    expect(args.onSell).not.toHaveBeenCalled();
  });

  test('Do not call onPurchase or onSell since all transaction are outside the date range', () => {
    const ticker = faker.random.word().toLowerCase();
    const quantity = faker.random.number({ min: 1 });

    const args = {
      transactions: [
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 1),
          ticker,
          operation: 'buy' as Types.Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
        }),
        new Finance.Transaction({
          date: new DateUtils.CalendarDate(2020, 1, 2),
          ticker,
          operation: 'sell' as Types.Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
        }),
      ],
      startDate: new DateUtils.CalendarDate(2020, 1, 3),
      endDate: new DateUtils.CalendarDate(2020, 1, 3),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    Finance.statsFrom(args);

    expect(args.onPurchase).not.toHaveBeenCalled();
    expect(args.onSell).not.toHaveBeenCalled();
  });
});
