import faker from 'faker';

import { CalendarDate } from 'src/utils/date';
import type { Operation, Transaction as _Transaction } from 'src/types';

import Transaction from './transaction';

const date = new CalendarDate(2020, 1, 1);
const ticker = faker.random.word().toLowerCase();

const limit = { min: 1, max: 100 };

const quantity = {
  valid: faker.random.number(limit),
  invalid: faker.random.number({ min: -100, max: 0 }),
};

const averagePrice = {
  valid: faker.random.float(limit),
  invalid: faker.random.float({ min: -100, max: 0 }),
};

const transactionTax = faker.random.float(limit);
const taxDeduction = faker.random.float(limit);

type MakeTransaction = {
  operation: Operation;
  quantity: number;
  averagePrice: number;
};

const makeTransaction = ({
  operation,
  quantity,
  averagePrice,
}: MakeTransaction) => (): _Transaction =>
  new Transaction({
    date,
    ticker,
    operation,
    quantity,
    averagePrice,
    transactionTax,
    taxDeduction: operation === 'sell' ? taxDeduction : 0,
  });

describe('Transaction', () => {
  test('Throws when expected', () => {
    const testCases = [
      {
        transaction: makeTransaction({
          operation: 'buy',
          quantity: quantity.valid,
          averagePrice: averagePrice.valid,
        }),
        shouldThrow: false,
      },
      {
        transaction: makeTransaction({
          operation: 'sell',
          quantity: quantity.valid,
          averagePrice: averagePrice.valid,
        }),
        shouldThrow: false,
      },
      {
        transaction: makeTransaction({
          operation: 'buy',
          quantity: quantity.invalid,
          averagePrice: averagePrice.valid,
        }),
        shouldThrow: true,
      },
      {
        transaction: makeTransaction({
          operation: 'sell',
          quantity: quantity.invalid,
          averagePrice: averagePrice.valid,
        }),
        shouldThrow: true,
      },
      {
        transaction: makeTransaction({
          operation: 'buy',
          quantity: quantity.valid,
          averagePrice: averagePrice.invalid,
        }),
        shouldThrow: true,
      },
      {
        transaction: makeTransaction({
          operation: 'sell',
          quantity: quantity.valid,
          averagePrice: averagePrice.invalid,
        }),
        shouldThrow: true,
      },
      {
        transaction: makeTransaction({
          operation: 'buy',
          quantity: quantity.invalid,
          averagePrice: averagePrice.invalid,
        }),
        shouldThrow: true,
      },
      {
        transaction: makeTransaction({
          operation: 'sell',
          quantity: quantity.invalid,
          averagePrice: averagePrice.invalid,
        }),
        shouldThrow: true,
      },
    ];

    testCases.forEach(({ transaction, shouldThrow }) => {
      shouldThrow
        ? expect(() => transaction()).toThrow()
        : expect(() => transaction()).not.toThrow();
    });
  });
});
