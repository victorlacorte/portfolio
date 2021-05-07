import {
  add,
  correctionFactor,
  div,
  // format,
  mul,
  multiplier,
  sub,
  // toCurrency,
  // toFixed,
  trunc,
} from './number';

test('multiplier', () => {
  expect(multiplier(1.2)).toBe(10);
  expect(multiplier(1.2)).toBe(10);
  expect(multiplier(1.2)).toBe(10);
  expect(multiplier(1.201)).toBe(1000);
  expect(multiplier(1)).toBe(1);
});

test('correctionFactor', () => {
  expect(correctionFactor(1, 1)).toBe(1);
  expect(correctionFactor(1, 1.1)).toBe(10);
  expect(correctionFactor(1.1, 1.1)).toBe(10);
  expect(correctionFactor(1.1, 1.101)).toBe(1000);
  expect(correctionFactor(1.1001, 1.101)).toBe(10000);
});

test('add', () => {
  expect(add(0)).toBe(0);
  expect(add(0, 0)).toBe(0);
  expect(add(1000, 10)).toBe(1010);
  expect(add(0.5, 3)).toBe(3.5);
  expect(add(-100, 200)).toBe(100);
  expect(add(0.1, 0.2)).toBe(0.3);
  expect(add(0.28, 0.01)).toBe(0.29);
  expect(add(0.289999, 0.000001)).toBe(0.29);
  expect(add(0.29, 0.01)).toBe(0.3);
});

test('sub', () => {
  expect(sub(0)).toBe(0);
  expect(sub(0, 0)).toBe(0);
  expect(sub(1000, 10)).toBe(990);
  expect(sub(0.5, 3)).toBe(-2.5);
  expect(sub(-100, 200)).toBe(-300);
  expect(sub(0.1, 0.2)).toBe(-0.1);
  expect(sub(0.28, 0.01)).toBe(0.27);
  expect(sub(0.289999, 0.000001)).toBe(0.289998);
  expect(sub(0.29, 0.01)).toBe(0.28);
  expect(sub(3, 2, 1)).toBe(0);
});

test('mul', () => {
  expect(mul(0)).toBe(0);
  expect(mul(0, 0)).toBe(0);
  expect(mul(1000, 10)).toBe(10000);
  expect(mul(0.5, 3)).toBe(1.5);
  expect(mul(-100, 200)).toBe(-20000);
  expect(mul(0.1, 0.2)).toBe(0.02);
  expect(mul(0.28, 0.01)).toBe(0.0028);
  expect(mul(0.00000231, 10000000)).toBe(23.1);
});

test('div', () => {
  expect(div(0)).toBe(0);
  expect(div(0, 1)).toBe(0);
  expect(div(1000, 10)).toBe(100);
  expect(div(0.5, 3)).toBe(0.16666666666666666);
  expect(div(-100, 200)).toBe(-0.5);
  expect(div(5.3, 0.1)).toBe(53);
  expect(div(0.28, 0.01)).toBe(28);
});

// test('format', () => {
//   expect(format(1234.56)).toBe('1,235');
//   expect(format(1234.56, 2, ',', ' ')).toBe('1 234,56');
//   expect(format(1234.5678, 2, '.', '')).toBe('1234.57');
//   expect(format(67, 2, ',', '.')).toBe('67,00');
//   expect(format(1000)).toBe('1,000');
//   expect(format(67.311, 2)).toBe('67.31');
//   expect(format(1000.55, 1)).toBe('1,000.6');
//   expect(format(67000, 5, ',', '.')).toBe('67.000,00000');
//   expect(format(0.9, 0)).toBe('1');
//   expect(format(1.2, 2)).toBe('1.20');
//   expect(format(1.2, 4)).toBe('1.2000');
//   expect(format(1.2, 3)).toBe('1.200');
// });

// test('toCurrency', () => {
//   expect(toCurrency(0)).toBe('0.00');
//   expect(toCurrency(1000)).toBe('1,000.00');
//   expect(toCurrency(1000.5)).toBe('1,000.50');
//   expect(toCurrency(1000.499)).toBe('1,000.50');
//   expect(toCurrency(-1000.499)).toBe('-1,000.50');
// });

// test('toFixed', () => {
//   expect(toFixed(1 / 3, 3)).toBe(0.333);
//   expect(toFixed(0.1, 0)).toBe(0);
//   expect(toFixed(0.1, 1)).toBe(0.1);
//   expect(toFixed(0.1, 2)).toBe(0.1);
//   expect(toFixed(0.5, 0)).toBe(1);
//   expect(toFixed(0.5, 1)).toBe(0.5);
//   expect(toFixed(0.55, 1)).toBe(0.6);
// });

test.each([
  [1, undefined, 1],
  [1, 1, 1],
  [1, 2, 1],
  [1.4, undefined, 1],
  [1.5, undefined, 1],
  [1.4, 1, 1.4],
  [1.45, 1, 1.4],
  [1.4, 2, 1.4],
  [1.455, 2, 1.45],
])('trunc(%f, %i) = %s', (num, digits, expected) => {
  expect(trunc(num, digits)).toBe(expected);
});
