import faker from 'faker';

import { SimpleDate } from 'src/utils/date';
import type { Operation, Transaction as _Transaction } from 'src/types';

import Transaction from './transaction';
import { statsFrom } from './helpers';

const limit = { min: 1, max: 100 };

const date = SimpleDate.make({ year: 2020, month: 1, day: 1 });
const ticker = faker.random.word().toLowerCase();
const quantity = faker.random.number(limit);
// const quantity = 100;
const averagePrice = faker.random.float(limit);
const transactionTax = faker.random.float(limit);
const taxDeduction = faker.random.float(limit);

const makeTransaction = (operation: Operation): _Transaction =>
  Transaction.make({
    date,
    ticker,
    operation,
    quantity,
    averagePrice,
    transactionTax,
    taxDeduction: operation === 'sell' ? taxDeduction : 0,
  });

// TODO most of these tests should be rewritten in their respective scopes
describe('statsFrom', () => {
  test('Calls onBuy for each `buy` transaction, and onSell for each `sell` transaction', () => {
    const args = {
      transactions: [makeTransaction('buy')],
      onBuy: jest.fn(),
      onSell: jest.fn(),
    };

    statsFrom(args);

    expect(args.onBuy).toHaveBeenCalledTimes(1);
    expect(args.onSell).not.toHaveBeenCalled();

    args.onBuy.mockReset();
    args.onSell.mockReset();

    statsFrom({
      ...args,
      transactions: [makeTransaction('buy'), makeTransaction('buy')],
    });

    expect(args.onBuy).toHaveBeenCalledTimes(2);
    expect(args.onSell).not.toHaveBeenCalled();

    args.onBuy.mockReset();
    args.onSell.mockReset();

    statsFrom({
      ...args,
      transactions: [makeTransaction('buy'), makeTransaction('sell')],
    });

    expect(args.onBuy).toHaveBeenCalledTimes(1);
    expect(args.onSell).toHaveBeenCalledTimes(1);
  });

  test('Throw an error by attempting to sell before buying', () => {
    const args = {
      transactions: [makeTransaction('sell'), makeTransaction('buy')],
      onBuy: jest.fn(),
      onSell: jest.fn(),
    };

    expect(() => statsFrom(args)).toThrow();

    expect(args.onBuy).not.toHaveBeenCalled();
    expect(args.onSell).not.toHaveBeenCalled();
  });

  test('Throw an error attempting to sell an amount not owned', () => {
    const ticker = faker.random.word().toLowerCase();

    const args = {
      transactions: [
        Transaction.make({
          date: SimpleDate.make(2020, 1, 1),
          ticker,
          operation: 'buy',
          quantity: 1,
          averagePrice,
          transactionTax,
        }),
        Transaction.make({
          date: SimpleDate.make(2020, 1, 2),
          ticker,
          operation: 'sell',
          quantity: 2,
          averagePrice: averagePrice + 1,
          transactionTax,
          taxDeduction,
        }),
      ],
      onBuy: jest.fn(),
      onSell: jest.fn(),
    };

    expect(() => statsFrom(args)).toThrow();

    expect(args.onBuy).toHaveBeenCalledTimes(1);
    expect(args.onSell).not.toHaveBeenCalled();
  });

  test('Throw an error attempting to sell a ticker absent from the portfolio', () => {
    const quantity = faker.random.number({ min: 1 });

    const args = {
      transactions: [
        Transaction.make({
          date: SimpleDate.make(2020, 1, 1),
          ticker: 'foo1',
          operation: 'buy',
          quantity,
          averagePrice,
          transactionTax,
        }),
        Transaction.make({
          date: SimpleDate.make(2020, 1, 2),
          ticker: 'foo2',
          operation: 'sell',
          quantity,
          averagePrice,
          transactionTax,
          taxDeduction,
        }),
      ],
      onBuy: jest.fn(),
      onSell: jest.fn(),
    };

    expect(() => statsFrom(args)).toThrow();

    expect(args.onBuy).toHaveBeenCalledTimes(1);
    expect(args.onSell).not.toHaveBeenCalled();
  });
});

// TODO describe filterTransactions
