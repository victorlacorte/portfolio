import faker from 'faker';

import SimpleDate from '../utils/date';
import { add } from '../utils/number';
import type { BuyTransaction, Position, Transaction } from '../types';

import portfolioReducer, { lastEntryFrom } from './portfolio';
import { averagePrice } from './functions';

// TODO tests did not break after modifying the portfolio sell entry

// The date and ticker are irrelevant to all tests
const date = SimpleDate.make(2020, 1, 1);
const ticker = faker.random.alphaNumeric(5);

// buy.min >= abs(sell.max) or we could run into invalid number combinations
// e.g. sell quantity > buy one
const makeBuyQuantity = (): number => faker.datatype.number({ min: 100 });
const makeSellQuantity = (): number =>
  faker.datatype.number({ min: -100, max: -1 });
const makePrice = (): number => faker.datatype.float({ min: 0 });
const makeTax = (): number => faker.datatype.float({ min: 0 });
const makeIrrf = (): number => faker.datatype.float({ min: 0 });

describe('finance/portfolioReducer', () => {
  it('Correctly reproduces the example in https://www.bussoladoinvestidor.com.br/calculo-do-preco-medio-de-acoes/', () => {
    const ticker = 'petr4';
    const t: Transaction[] = [
      {
        kind: 'buy',
        date: SimpleDate.make(2020, 2, 3),
        ticker,
        price: 9,
        quantity: 100,
        tax: 21.5,
      },
      {
        kind: 'buy',
        date: SimpleDate.make(2020, 2, 5),
        ticker,
        price: 12,
        quantity: 100,
        tax: 21.7,
      },
      {
        kind: 'sell',
        date: SimpleDate.make(2020, 2, 5),
        ticker,
        price: 11.5,
        quantity: 50,
        tax: 20.86,
        irrf: 0.01,
      },
      {
        kind: 'buy',
        date: SimpleDate.make(2020, 2, 10),
        ticker,
        price: 15,
        quantity: 200,
        tax: 23.6,
      },
    ];

    const res = t.reduce(portfolioReducer, {});

    expect(res).toMatchSnapshot();
    expect(lastEntryFrom(res, ticker).price).toBe(13.2314);
  });

  test('Throws when attempting to sell a non-existent ticker', () => {});
  test('Throws when attempting to sell an invalid amount', () => {});
});
