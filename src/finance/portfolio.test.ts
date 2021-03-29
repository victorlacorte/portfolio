import faker from 'faker';

import { SimpleDate } from 'src/utils/date';
import { toFixed } from 'src/utils/number';
import type { Operation } from 'src/types';

import Portfolio from './portfolio';
import Transaction from './transaction';

const ticker = faker.random.word().toLowerCase();

// TODO the Portfolio should guarantee onBuy/onSell callbacks are called when expected
describe('Portfolio', () => {
  test('The averagePrice behaves as expected after successive buy operations', () => {
    // reproducing the example in https://www.bussoladoinvestidor.com.br/calculo-do-preco-medio-de-acoes/
    // 1. 01/01: buy 100 stocks, average buy price = 9.215: average price = 9.22
    // 2. 01/02: buy 100 stocks, average buy price = 12.217: average price = (9.22*100 + 12.217*100) / 200 = 10.72
    // 3. 01/03: buy 200 stocks, average buy price = 15.118: average price = (10.72*200 + 15.118 * 200) / 400 = 12.92

    const portfolio = Portfolio.make();

    portfolio.add(
      Transaction.make({
        date: SimpleDate.make({ year: 2020, month: 1, day: 1 }),
        ticker,
        operation: 'buy',
        quantity: 100,
        averagePrice: 9.215,
        transactionTax: 0.01,
      }),
    );

    expect(toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(9.22);

    portfolio.add(
      Transaction.make({
        date: SimpleDate.make({ year: 2020, month: 1, day: 2 }),
        ticker,
        operation: 'buy',
        quantity: 100,
        averagePrice: 12.217,
        transactionTax: 0.01,
      }),
    );

    expect(toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(10.72);

    portfolio.add(
      Transaction.make({
        date: SimpleDate.make({ year: 2020, month: 1, day: 3 }),
        ticker,
        operation: 'buy',
        quantity: 200,
        averagePrice: 15.118,
        transactionTax: 0.01,
      }),
    );

    expect(toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(12.92);
  });

  test('The averagePrice behaves as expected after buy and sell operations', () => {
    // reproducing the example in https://www.bussoladoinvestidor.com.br/calculo-do-preco-medio-de-acoes/
    // 1. 01/01: buy 100 stocks, average buy price = 9.215: average price = 9.22
    // 2. 01/02: buy 100 stocks, average buy price = 12.217: average price = (9.22*100 + 12.217*100) / 200 = 10.72
    // 3. 01/03: sell 50 stocks, the price does not matter: average price = 10.72 (previous one)
    // 3. 01/04: buy 200 stocks, average buy price = 15.118: average price = (10.72*150 + 15.118*200) / 350 = 13.23

    const portfolio = Portfolio.make();

    portfolio.add(
      Transaction.make({
        date: SimpleDate.make({ year: 2020, month: 1, day: 1 }),
        ticker,
        operation: 'buy',
        quantity: 100,
        averagePrice: 9.215,
        transactionTax: 0.01,
      }),
    );

    expect(toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(9.22);

    portfolio.add(
      Transaction.make({
        date: SimpleDate.make({ year: 2020, month: 1, day: 2 }),
        ticker,
        operation: 'buy',
        quantity: 100,
        averagePrice: 12.217,
        transactionTax: 0.01,
      }),
    );

    expect(toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(10.72);

    portfolio.add(
      Transaction.make({
        date: SimpleDate.make({ year: 2020, month: 1, day: 3 }),
        ticker,
        operation: 'sell',
        quantity: 50,
        averagePrice: faker.random.float({ min: 1 }),
        transactionTax: 0.01,
        taxDeduction: 0.01,
      }),
    );

    portfolio.add(
      Transaction.make({
        date: SimpleDate.make({ year: 2020, month: 1, day: 4 }),
        ticker,
        operation: 'buy',
        quantity: 200,
        averagePrice: 15.118,
        transactionTax: 0.01,
      }),
    );

    expect(toFixed(portfolio.stats[ticker].averagePrice, 2)).toBe(13.23);
  });
});
