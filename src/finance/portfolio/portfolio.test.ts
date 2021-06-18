import SimpleDate from 'src/utils/date';
import type { Transaction } from 'src/types';

import portfolioReducer, { lastEntryFrom } from './portfolio';

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

    const last = lastEntryFrom(res, ticker);
    expect(last.price).toBe(13.2314);
    expect(last.quantity).toBe(350);
  });

  it('Throws when attempting to sell a non-existent ticker', () => {});
  it('Throws when attempting to sell an invalid amount', () => {});
});
