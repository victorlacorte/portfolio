import faker from 'faker';

import { CalendarDate } from 'src/utils/date';
import type { Operation } from 'src/types';

import Transaction from './transaction';
import { statsFrom } from './helpers';

describe('statsFrom', () => {
  test('Calls onPurchase for each `buy` transaction, and onSell for each `sell` transaction', () => {
    // Reutilize the same ticker and quantity to be able to sell the purchased amount
    const quantity = faker.random.number({ min: 1 });
    const ticker = faker.random.word().toLowerCase();

    // Total is irrelevant; simply needs to be a valid amount
    const total = faker.random.number({ min: 1 });

    const args = {
      transactions: [
        new Transaction({
          date: new CalendarDate(2020, 1, 1),
          ticker,
          operation: 'buy' as Operation,
          quantity,
          total,
        }),
      ],
      startDate: new CalendarDate(2020, 1, 1),
      endDate: new CalendarDate(2020, 1, 31),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    statsFrom(args);

    expect(args.onPurchase).toHaveBeenCalledTimes(1);
    expect(args.onSell).not.toHaveBeenCalled();

    args.onPurchase.mockReset();
    args.onSell.mockReset();

    statsFrom({
      ...args,
      transactions: [
        new Transaction({
          date: new CalendarDate(2020, 1, 1),
          ticker,
          operation: 'buy' as Operation,
          quantity,
          total,
        }),
        new Transaction({
          date: new CalendarDate(2020, 1, 2),
          ticker,
          operation: 'buy' as Operation,
          quantity,
          total,
        }),
      ],
    });

    expect(args.onPurchase).toHaveBeenCalledTimes(2);
    expect(args.onSell).not.toHaveBeenCalled();

    args.onPurchase.mockReset();
    args.onSell.mockReset();

    statsFrom({
      ...args,
      transactions: [
        new Transaction({
          date: new CalendarDate(2020, 1, 1),
          ticker,
          operation: 'buy' as Operation,
          quantity,
          total,
        }),
        new Transaction({
          date: new CalendarDate(2020, 1, 2),
          ticker,
          operation: 'sell' as Operation,
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
        new Transaction({
          date: new CalendarDate(2020, 1, 1),
          ticker,
          operation: 'sell' as Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
        }),
        new Transaction({
          date: new CalendarDate(2020, 1, 2),
          ticker,
          operation: 'buy' as Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
        }),
      ],
      startDate: new CalendarDate(2020, 1, 1),
      endDate: new CalendarDate(2020, 1, 2),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    expect(() => statsFrom(args)).toThrow();

    expect(args.onPurchase).not.toHaveBeenCalled();
    expect(args.onSell).not.toHaveBeenCalled();
  });

  test('Throw an error attempting to sell an amount not owned', () => {
    const ticker = faker.random.word().toLowerCase();

    const args = {
      transactions: [
        new Transaction({
          date: new CalendarDate(2020, 1, 1),
          ticker,
          operation: 'buy' as Operation,
          quantity: 1,
          total: faker.random.number({ min: 1 }),
        }),
        new Transaction({
          date: new CalendarDate(2020, 1, 2),
          ticker,
          operation: 'sell' as Operation,
          quantity: 2,
          total: faker.random.number({ min: 1 }),
        }),
      ],
      startDate: new CalendarDate(2020, 1, 1),
      endDate: new CalendarDate(2020, 1, 2),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    expect(() => statsFrom(args)).toThrow();

    expect(args.onPurchase).toHaveBeenCalledTimes(1);
    expect(args.onSell).not.toHaveBeenCalled();
  });

  test('Throw an error attempting to sell a ticker absent from the portfolio', () => {
    const quantity = faker.random.number({ min: 1 });

    const args = {
      transactions: [
        new Transaction({
          date: new CalendarDate(2020, 1, 1),
          ticker: 'foo1',
          operation: 'buy' as Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
        }),
        new Transaction({
          date: new CalendarDate(2020, 1, 2),
          ticker: 'foo2',
          operation: 'sell' as Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
        }),
      ],
      startDate: new CalendarDate(2020, 1, 1),
      endDate: new CalendarDate(2020, 1, 2),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    expect(() => statsFrom(args)).toThrow();

    expect(args.onPurchase).toHaveBeenCalledTimes(1);
    expect(args.onSell).not.toHaveBeenCalled();
  });

  test('Do not call onSell since the `sell` transaction is outside the date range', () => {
    const ticker = faker.random.word().toLowerCase();
    const quantity = faker.random.number({ min: 1 });

    const args = {
      transactions: [
        new Transaction({
          date: new CalendarDate(2020, 1, 1),
          ticker,
          operation: 'buy' as Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
        }),
        new Transaction({
          date: new CalendarDate(2020, 1, 2),
          ticker,
          operation: 'sell' as Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
        }),
      ],
      startDate: new CalendarDate(2020, 1, 1),
      endDate: new CalendarDate(2020, 1, 1),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    statsFrom(args);

    expect(args.onPurchase).toHaveBeenCalledTimes(1);
    expect(args.onSell).not.toHaveBeenCalled();
  });

  test('Do not call onPurchase or onSell since all transaction are outside the date range', () => {
    const ticker = faker.random.word().toLowerCase();
    const quantity = faker.random.number({ min: 1 });

    const args = {
      transactions: [
        new Transaction({
          date: new CalendarDate(2020, 1, 1),
          ticker,
          operation: 'buy' as Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
        }),
        new Transaction({
          date: new CalendarDate(2020, 1, 2),
          ticker,
          operation: 'sell' as Operation,
          quantity,
          total: faker.random.number({ min: 1 }),
        }),
      ],
      startDate: new CalendarDate(2020, 1, 3),
      endDate: new CalendarDate(2020, 1, 3),
      onPurchase: jest.fn(),
      onSell: jest.fn(),
    };

    statsFrom(args);

    expect(args.onPurchase).not.toHaveBeenCalled();
    expect(args.onSell).not.toHaveBeenCalled();
  });
});
