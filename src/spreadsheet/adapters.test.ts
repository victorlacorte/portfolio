import {
  days,
  irrfs,
  months,
  operations,
  prices,
  quantities,
  taxes,
  tickers,
  years,
} from './__mocks__/backlog';
import { position } from './adapters';

describe('spreadsheet/adapters', () => {
  test('position', () => {
    expect(
      position(
        years,
        months,
        days,
        tickers,
        operations,
        quantities,
        prices,
        taxes,
        irrfs,
      ),
    ).toMatchInlineSnapshot(`
      Array [
        Array [
          "ticker",
          "buyQuantity",
          "buyTotal",
          "date",
          "price",
          "quantity",
          "sellIrrf",
          "sellProfit",
          "sellProfitPercent",
          "sellQuantity",
          "sellTotal",
        ],
        Array [
          "foo1",
          200,
          201,
          "2020/01/01",
          1.005,
          200,
          0,
          0,
          0,
          0,
          0,
        ],
        Array [
          "foo1",
          0,
          0,
          "2020/01/01",
          1.005,
          100,
          1.5,
          98.5,
          0.98,
          100,
          199,
        ],
        Array [
          "foo1",
          100,
          51,
          "2020/01/01",
          0.7575,
          200,
          0,
          0,
          0,
          0,
          0,
        ],
      ]
    `);
  });
});
