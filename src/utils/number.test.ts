import { NumberUtils } from './number';

test('multiplier', () => {
  expect(NumberUtils.multiplier(1.2)).toBe(10);
  expect(NumberUtils.multiplier(1.2)).toBe(10);
  expect(NumberUtils.multiplier(1.2)).toBe(10);
  expect(NumberUtils.multiplier(1.201)).toBe(1000);
  expect(NumberUtils.multiplier(1)).toBe(1);
});

test('correctionFactor', () => {
  expect(NumberUtils.correctionFactor(1, 1)).toBe(1);
  expect(NumberUtils.correctionFactor(1, 1.1)).toBe(10);
  expect(NumberUtils.correctionFactor(1.1, 1.1)).toBe(10);
  expect(NumberUtils.correctionFactor(1.1, 1.101)).toBe(1000);
  expect(NumberUtils.correctionFactor(1.1001, 1.101)).toBe(10000);
});

test('add', () => {
  expect(NumberUtils.add(0)).toBe(0);
  expect(NumberUtils.add(0, 0)).toBe(0);
  expect(NumberUtils.add(1000, 10)).toBe(1010);
  expect(NumberUtils.add(0.5, 3)).toBe(3.5);
  expect(NumberUtils.add(-100, 200)).toBe(100);
  expect(NumberUtils.add(0.1, 0.2)).toBe(0.3);
  expect(NumberUtils.add(0.28, 0.01)).toBe(0.29);
  expect(NumberUtils.add(0.289999, 0.000001)).toBe(0.29);
  expect(NumberUtils.add(0.29, 0.01)).toBe(0.3);
});

test('sub', () => {
  expect(NumberUtils.sub(0)).toBe(0);
  expect(NumberUtils.sub(0, 0)).toBe(0);
  expect(NumberUtils.sub(1000, 10)).toBe(990);
  expect(NumberUtils.sub(0.5, 3)).toBe(-2.5);
  expect(NumberUtils.sub(-100, 200)).toBe(-300);
  expect(NumberUtils.sub(0.1, 0.2)).toBe(-0.1);
  expect(NumberUtils.sub(0.28, 0.01)).toBe(0.27);
  expect(NumberUtils.sub(0.289999, 0.000001)).toBe(0.289998);
  expect(NumberUtils.sub(0.29, 0.01)).toBe(0.28);
  expect(NumberUtils.sub(3, 2, 1)).toBe(0);
});

test('mul', () => {
  expect(NumberUtils.mul(0)).toBe(0);
  expect(NumberUtils.mul(0, 0)).toBe(0);
  expect(NumberUtils.mul(1000, 10)).toBe(10000);
  expect(NumberUtils.mul(0.5, 3)).toBe(1.5);
  expect(NumberUtils.mul(-100, 200)).toBe(-20000);
  expect(NumberUtils.mul(0.1, 0.2)).toBe(0.02);
  expect(NumberUtils.mul(0.28, 0.01)).toBe(0.0028);
  expect(NumberUtils.mul(0.00000231, 10000000)).toBe(23.1);
});

test('div', () => {
  expect(NumberUtils.div(0)).toBe(0);
  expect(NumberUtils.div(0, 1)).toBe(0);
  expect(NumberUtils.div(1000, 10)).toBe(100);
  expect(NumberUtils.div(0.5, 3)).toBe(0.16666666666666666);
  expect(NumberUtils.div(-100, 200)).toBe(-0.5);
  expect(NumberUtils.div(5.3, 0.1)).toBe(53);
  expect(NumberUtils.div(0.28, 0.01)).toBe(28);
});

test('format', () => {
  expect(NumberUtils.format(1234.56)).toBe('1,235');
  expect(NumberUtils.format(1234.56, 2, ',', ' ')).toBe('1 234,56');
  expect(NumberUtils.format(1234.5678, 2, '.', '')).toBe('1234.57');
  expect(NumberUtils.format(67, 2, ',', '.')).toBe('67,00');
  expect(NumberUtils.format(1000)).toBe('1,000');
  expect(NumberUtils.format(67.311, 2)).toBe('67.31');
  expect(NumberUtils.format(1000.55, 1)).toBe('1,000.6');
  expect(NumberUtils.format(67000, 5, ',', '.')).toBe('67.000,00000');
  expect(NumberUtils.format(0.9, 0)).toBe('1');
  expect(NumberUtils.format(1.2, 2)).toBe('1.20');
  expect(NumberUtils.format(1.2, 4)).toBe('1.2000');
  expect(NumberUtils.format(1.2, 3)).toBe('1.200');
});

test('toCurrency', () => {
  expect(NumberUtils.toCurrency(0)).toBe('0.00');
  expect(NumberUtils.toCurrency(1000)).toBe('1,000.00');
  expect(NumberUtils.toCurrency(1000.5)).toBe('1,000.50');
  expect(NumberUtils.toCurrency(1000.499)).toBe('1,000.50');
  expect(NumberUtils.toCurrency(-1000.499)).toBe('-1,000.50');
});

test('toFixed', () => {
  expect(NumberUtils.toFixed(1 / 3, 3)).toBe(0.333);
  expect(NumberUtils.toFixed(0.1, 0)).toBe(0);
  expect(NumberUtils.toFixed(0.1, 1)).toBe(0.1);
  expect(NumberUtils.toFixed(0.1, 2)).toBe(0.1);
  expect(NumberUtils.toFixed(0.5, 0)).toBe(1);
  expect(NumberUtils.toFixed(0.5, 1)).toBe(0.5);
  expect(NumberUtils.toFixed(0.55, 1)).toBe(0.6);
});
