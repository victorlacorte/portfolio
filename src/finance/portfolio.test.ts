import faker from 'faker';

import { CalendarDate } from 'src/utils/date';
import { toFixed } from 'src/utils/number';
import type { Operation } from 'src/types';

import Transaction from './transaction';

// import { CalendarDate } from './utils/date';
// import { toFixed } from './utils/number';
// import type { Operation } from './types';

import Portfolio from './portfolio';

describe('Portfolio', () => {
  test('The averagePrice behaves as expected after successive buy operations', () => {
    // reproducing the example in https://www.bussoladoinvestidor.com.br/calculo-do-preco-medio-de-acoes/
    // 1. 01/01: 9.215
    // 2. 01/02: (9.215*100 + 12.217*100) / 200 = 10.716
    // 3. 01/03: (10.716*200 + 15.118 * 200) / 400 = 12.917

    const ticker = faker.random.word().toLowerCase();

    const portfolio = new Portfolio();

    portfolio.add(
      new Transaction({
        date: new CalendarDate(2020, 1, 1),
        ticker,
        operation: 'buy' as Operation,
        quantity: 100,
        total: 921.5,
      }),
    );

    expect(toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(9.22);

    portfolio.add(
      new Transaction({
        date: new CalendarDate(2020, 1, 2),
        ticker,
        operation: 'buy' as Operation,
        quantity: 100,
        total: 1221.7,
      }),
    );

    expect(toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(10.72);

    portfolio.add(
      new Transaction({
        date: new CalendarDate(2020, 1, 3),
        ticker,
        operation: 'buy' as Operation,
        quantity: 200,
        total: 3023.6,
      }),
    );

    expect(toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(12.92);
  });

  test('The averagePrice behaves as expected after buy and sell operations', () => {
    // reproducing the example in https://www.bussoladoinvestidor.com.br/calculo-do-preco-medio-de-acoes/
    // 1. 01/01: 9.215
    // 2. 01/02: (9.215*100 + 12.217*100) / 200 = 10.716
    // 3. 01/04: (10.716*150 + 15.118*200) / 350 = 13.231

    const ticker = faker.random.word().toLocaleLowerCase();

    const portfolio = new Portfolio();

    portfolio.add(
      new Transaction({
        date: new CalendarDate(2020, 1, 1),
        ticker,
        operation: 'buy' as Operation,
        quantity: 100,
        total: 921.5,
      }),
    );

    expect(toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(9.22);

    portfolio.add(
      new Transaction({
        date: new CalendarDate(2020, 1, 2),
        ticker,
        operation: 'buy' as Operation,
        quantity: 100,
        total: 1221.7,
      }),
    );

    expect(toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(10.72);

    portfolio.add(
      new Transaction({
        date: new CalendarDate(2020, 1, 3),
        ticker,
        operation: 'sell' as Operation,
        quantity: 50,
        total: faker.random.number(),
      }),
    );

    portfolio.add(
      new Transaction({
        date: new CalendarDate(2020, 1, 4),
        ticker,
        operation: 'buy' as Operation,
        quantity: 200,
        total: 3023.6,
      }),
    );

    expect(toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(13.23);
  });
});
