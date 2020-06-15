import { Types } from 'src/utils/types';

export namespace Messages {
  // prettier-ignore
  export const invalidSellQty = 'Invalid sell quantity: available total is less than the purchased one';
  export const diffLengthNR = 'Named ranges contain different non-empty cells';

  // prettier-ignore
  export const expectedReceived = (expected, received, line?: number): string => {
    const msg = `Expected ${expected}, got ${received} instead`;

    return line ? `[Line ${line}] ${msg}` : msg;
  }

  export const expectedPostiveOrZero = (n: number, line?: number): string =>
    expectedReceived('a positive number or zero', n, line);

  export const expectedPostive = (n: number, line?: number): string =>
    expectedReceived('a positive number', n, line);

  export const expectedFinite = (n: number, line?: number): string =>
    expectedReceived('a finite number', n, line);
}
