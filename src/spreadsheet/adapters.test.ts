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
import { irpf, position } from './adapters';

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
    ).toMatchSnapshot();
  });

  test('irpf', () => {
    expect(
      irpf(
        2020,
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
    ).toMatchSnapshot();
  });
});
