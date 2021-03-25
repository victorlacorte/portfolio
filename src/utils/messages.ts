// TODO candidate for deprecation
export const invalidSellQty =
  'Invalid sell quantity: available total is less than the purchased one';

export const diffLengthNR = 'Named ranges contain different non-empty cells';

export const expectedReceived = (
  expected: unknown,
  received: unknown,
  line?: number,
): string => {
  const msg = `Expected ${expected}, got ${received} instead`;

  return line ? `[Line ${line}] ${msg}` : msg;
};

export const expectedPositiveOrZero = (n: number, line?: number): string =>
  expectedReceived('a positive number or zero', n, line);

export const expectedPositive = (n: number, line?: number): string =>
  expectedReceived('a positive number', n, line);

export const expectedFinite = (n: number, line?: number): string =>
  expectedReceived('a finite number', n, line);
