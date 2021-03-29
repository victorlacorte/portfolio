import faker from 'faker';

import { SimpleDate } from 'src/utils/date';
import { operations } from 'src/constants';
import type { Transaction as _Transaction, TransactionBase } from 'src/types';

import Transaction from './transaction';

const date = SimpleDate.make({ year: 2020, month: 1, day: 1 });
const ticker = faker.random.word().toLowerCase();

// max is arbitrary: valid numbers are >= 1
const validNumberlimit = { min: 1, max: 2 };

// min is arbitrary: invalid numbers are < 0
const invalidNumberLimit = { min: -2, max: -1 };

// TODO this test is not perfect since we should not rely on random values
// Also, averagePrice might be zero and is not covered
function makeNumber(isInt: boolean, isValid: boolean): number {
  const fn = isInt ? faker.random.number : faker.random.float;

  return fn(isValid ? validNumberlimit : invalidNumberLimit);
}

const makeTransaction = ({
  averagePrice,
  operation,
  quantity,
  transactionTax,
  taxDeduction,
  total,
}: Omit<TransactionBase, 'date' | 'ticker'>): _Transaction =>
  Transaction.make({
    // Date and ticker are irrelevant
    date,
    ticker,
    operation,
    quantity,
    averagePrice,
    transactionTax,
    taxDeduction,
    total,
  });

describe('finance/transaction/validation', () => {
  test('Throws when expected', () => {
    [true, false].forEach((isValidAveragePrice) => {
      [true, false].forEach((isValidQuantity) => {
        [true, false].forEach((isValidTransactionTax) => {
          [true, false].forEach((isValidTotal) => {
            [true, false].forEach((isValidTaxDeduction) => {
              // The outcome is independent of the operation
              operations.forEach((op) => {
                const make = () =>
                  makeTransaction({
                    averagePrice: isValidAveragePrice
                      ? makeNumber(false, true)
                      : makeNumber(false, false),
                    quantity: isValidQuantity
                      ? makeNumber(true, true)
                      : makeNumber(true, false),
                    transactionTax: isValidTransactionTax
                      ? makeNumber(false, true)
                      : makeNumber(false, false),
                    total: isValidTotal
                      ? makeNumber(false, true)
                      : makeNumber(false, false),
                    taxDeduction: isValidTaxDeduction
                      ? makeNumber(false, true)
                      : makeNumber(false, false),
                    operation: op,
                  });

                if (
                  isValidAveragePrice &&
                  isValidQuantity &&
                  isValidTransactionTax &&
                  isValidTotal &&
                  isValidTaxDeduction
                ) {
                  expect(() => make()).not.toThrow();
                } else {
                  expect(() => make()).toThrow();
                }
              });
            });
          });
        });
      });
    });
  });
});
