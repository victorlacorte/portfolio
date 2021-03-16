import faker from 'faker';

import { CalendarDate } from 'src/utils/date';
import type { Operation } from 'src/types';

import Transaction from './transaction';

describe('Transaction', () => {
  test('Throws when expected', () => {
    // Both ticker and date are not relevant for the tests
    const ticker = faker.random.word().toLowerCase();
    const date = new CalendarDate(2020, 1, 1);

    const validQuantity = faker.random.number({ min: 1 });
    const validTotal = faker.random.number({ min: 1 });

    const invalidQuantity = 0; // any non-positive integer
    const invalidTotal = -1; // any number less than zero

    const testCases = [
      {
        date,
        ticker,
        operation: 'buy' as Operation,
        quantity: validQuantity,
        total: validTotal,
        shouldThrow: false,
      },
      {
        date,
        ticker,
        operation: 'sell' as Operation,
        quantity: validQuantity,
        total: validTotal,
        shouldThrow: false,
      },
      {
        date,
        ticker,
        operation: 'buy' as Operation,
        quantity: invalidQuantity,
        total: validTotal,
        shouldThrow: true,
      },
      {
        date,
        ticker,
        operation: 'sell' as Operation,
        quantity: invalidQuantity,
        total: validTotal,
        shouldThrow: true,
      },
      {
        date,
        ticker,
        operation: 'buy' as Operation,
        quantity: validQuantity,
        total: invalidTotal,
        shouldThrow: true,
      },
      {
        date,
        ticker,
        operation: 'sell' as Operation,
        quantity: validQuantity,
        total: invalidTotal,
        shouldThrow: true,
      },
      {
        date,
        ticker,
        operation: 'buy' as Operation,
        quantity: invalidQuantity,
        total: invalidTotal,
        shouldThrow: true,
      },
      {
        date,
        ticker,
        operation: 'sell' as Operation,
        quantity: invalidQuantity,
        total: invalidTotal,
        shouldThrow: true,
      },
    ];

    testCases.forEach(({ shouldThrow, ...t }) => {
      if (shouldThrow) {
        expect(() => new Transaction(t)).toThrow();
      } else {
        expect(() => new Transaction(t)).not.toThrow();
      }
    });
  });
});
