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
          "foo1",
          "2020/01/01",
          "",
          1.0049,
          "",
          "",
          200,
          "",
        ],
        Array [
          "foo1",
          "2020/01/01",
          1.5,
          1.0049,
          98.51,
          0.9802,
          100,
          199,
        ],
        Array [
          "foo1",
          "2020/01/01",
          "",
          0.7574,
          "",
          "",
          200,
          "",
        ],
      ]
    `);
  });
});
