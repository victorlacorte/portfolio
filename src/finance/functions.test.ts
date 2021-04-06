import faker from 'faker';

import SimpleDate from '../utils/date';
import { add, div, mul } from '../utils/number';

import { averagePrice, profit, profitPercent, sellTotal } from './functions';

// The date is irrelevant to all tests
const date = SimpleDate.make(2020, 1, 1);

const makeQuantity = (): number => faker.random.number({ min: 1 });
const makePrice = (): number => faker.random.float({ min: 0 });
const makeTax = (): number => faker.random.float({ min: 0 });

function* repeat<T>(times: number, fn: () => T): Generator<T> {
  while (times--) {
    yield fn();
  }
}

describe('finance/functions', () => {
  describe('averagePrice', () => {
    test('tax = 0 so averagePrice = price', async () => {
      await Promise.all(
        repeat(1000, () => {
          const price = makePrice();

          expect(
            averagePrice({
              date,
              price,
              quantity: makeQuantity(),
              tax: 0,
            }),
          ).toBe(price);
        }),
      );
    });

    test("a simple transaction's average price", async () => {
      // averagePrice = (quantity * price + tax) / quantity
      await Promise.all(
        repeat(1000, () => {
          const price = makePrice();
          const quantity = makeQuantity();
          const tax = makeTax();

          const expected = div(add(mul(quantity, price), tax), quantity);

          expect(
            averagePrice({
              date,
              price,
              quantity,
              tax,
            }),
          ).toBe(expected);
        }),
      );
    });

    test("transaction price = portfolio's entry price = averagePrice", async () => {
      // transaction t, portfolioEntry p, tax = 0: t.price = p.price, t.quantity = p.quantity => averagePrice = t.price = p.price
      await Promise.all(
        repeat(1000, () => {
          const quantity = makeQuantity();
          const price = makePrice();

          expect(
            averagePrice(
              {
                date,
                price,
                quantity,
                tax: 0,
              },
              { price, quantity },
            ),
          ).toBe(price);
        }),
      );
    });

    test('average price accounting for a previous one', async () => {
      // transaction t, portfolioEntry p: averagePrice = (p.quantity * p.price + t.quantity * t.price + t.tax) / (p.quantity + t.quantity)
      await Promise.all(
        repeat(1000, () => {
          const t = {
            quantity: makeQuantity(),
            price: makePrice(),
            tax: makeTax(),
          };

          const p = {
            quantity: makeQuantity(),
            price: makePrice(),
          };

          const expected = div(
            add(mul(p.quantity, p.price), add(mul(t.quantity, t.price), t.tax)),
            add(p.quantity, t.quantity),
          );

          expect(
            averagePrice(
              {
                date,
                ...t,
              },
              p,
            ),
          ).toBe(expected);
        }),
      );
    });
  });
});
