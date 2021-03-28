import faker from 'faker';

import { CalendarDate } from 'src/utils/date';
import type { Operation, Transaction as _Transaction } from 'src/types';

import Transaction from './transaction';

const date = new CalendarDate(2020, 1, 1);
const ticker = faker.random.word().toLowerCase();

const validNumberlimit = { min: 1, max: 100 };
const invalidNumberLimit = { min: -100, max: 0 };

const transactionTax = faker.random.float(validNumberlimit);
const taxDeduction = faker.random.float(validNumberlimit);

const quantity = {
  valid() {
    return faker.random.number(validNumberlimit);
  },
  invalid() {
    return faker.random.number(invalidNumberLimit);
  },
};

const averagePrice = {
  valid() {
    return faker.random.float(validNumberlimit);
  },
  invalid() {
    return faker.random.float(invalidNumberLimit);
  },
};

type MakeTransaction = {
  operation: Operation;
  quantity: number;
  averagePrice: number;
};

const makeTransaction = ({
  averagePrice,
  operation,
  quantity,
}: MakeTransaction): _Transaction =>
  Transaction.make({
    date,
    ticker,
    operation,
    quantity,
    averagePrice,
    transactionTax,
    taxDeduction: operation === 'sell' ? taxDeduction : 0,
  });

describe('finance/transaction/validation', () => {
  test('Throws when expected', () => {
    const testCases = [
      {
        shouldThrow: false,
        quantity: quantity.valid(),
        averagePrice: averagePrice.valid(),
      },
      {
        shouldThrow: true,
        quantity: quantity.invalid(),
        averagePrice: averagePrice.valid(),
      },
      {
        shouldThrow: true,
        quantity: quantity.valid(),
        averagePrice: averagePrice.invalid(),
      },
      {
        shouldThrow: true,
        quantity: quantity.invalid(),
        averagePrice: averagePrice.invalid(),
      },
    ];

    testCases.forEach(({ shouldThrow, ...t }) => {
      ['buy', 'sell'].forEach((op) => {
        const transaction = makeTransaction({
          ...t,
          operation: op as Operation,
        });

        shouldThrow
          ? expect(() => transaction.validate()).toThrow()
          : expect(() => transaction.validate()).not.toThrow();
      });
    });
  });
});
