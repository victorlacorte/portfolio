import faker from 'faker';

import SimpleDate from '../utils/date';
import { add } from '../utils/number';

import Portfolio from './portfolio';
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

describe('finance/portfolio-wrapper', () => {
  test('Correctly processes a buy transaction', () => {
    const w = new Portfolio();
    const t = {
      date,
      ticker,
      price: makePrice(),
      quantity: makeBuyQuantity(),
      tax: makeTax(),
    };

    w.add(t);

    const entry = w.position[ticker][0];

    expect(entry.price).toBe(averagePrice(t));
    expect(entry.quantity).toBe(t.quantity);
  });

  test('Correctly processes two buy transactions', () => {
    const w = new Portfolio();
    const t1 = {
      date,
      ticker,
      price: makePrice(),
      quantity: makeBuyQuantity(),
      tax: makeTax(),
    };
    const t2 = {
      date,
      ticker,
      price: makePrice(),
      quantity: makeBuyQuantity(),
      tax: makeTax(),
    };

    w.add(t1);
    w.add(t2);

    const firstEntry = w.position[ticker][0];
    const secondEntry = w.position[ticker][1];

    expect(secondEntry.price).toBe(averagePrice(t2, firstEntry));
    expect(secondEntry.quantity).toBe(add(t1.quantity, t2.quantity));
  });

  test('Correctly processes a buy followed by a sell transaction', () => {
    const w = new Portfolio();
    const tBuy = {
      date,
      ticker,
      price: makePrice(),
      quantity: makeBuyQuantity(),
      tax: makeTax(),
    };
    const tSell = {
      date,
      ticker,
      price: makePrice(),
      quantity: makeSellQuantity(),
      tax: makeTax(),
      irrf: makeIrrf(),
    };

    w.add(tBuy);
    w.add(tSell);

    const buyEntry = w.position[ticker][0];
    const sellEntry = w.position[ticker][1];

    // Sell transactions don't modify the average price
    expect(sellEntry.price).toBe(buyEntry.price);
    expect(sellEntry.quantity).toBe(add(tBuy.quantity, tSell.quantity));
  });

  test('Correctly processes a buy, sell and another buy transactions', () => {
    const w = new Portfolio();
    const tBuy1 = {
      date,
      ticker,
      price: makePrice(),
      quantity: makeBuyQuantity(),
      tax: makeTax(),
    };
    const tSell = {
      date,
      ticker,
      price: makePrice(),
      quantity: makeSellQuantity(),
      tax: makeTax(),
      irrf: makeIrrf(),
    };
    const tBuy2 = {
      date,
      ticker,
      price: makePrice(),
      quantity: makeBuyQuantity(),
      tax: makeTax(),
    };

    w.add(tBuy1);
    w.add(tSell);
    w.add(tBuy2);

    const prevEntry = w.position[ticker][1]; // previous to last
    const lastEntry = w.position[ticker][2];

    expect(lastEntry.price).toBe(averagePrice(tBuy2, prevEntry));
    expect(lastEntry.quantity).toBe(
      add(tBuy1.quantity, tBuy2.quantity, tSell.quantity),
    );
  });

  test('Throws when attempting to sell a non-existent ticker', () => {});
  test('Throws when attempting to sell an invalid amount', () => {});
});
