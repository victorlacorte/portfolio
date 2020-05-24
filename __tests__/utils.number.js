describe('src/number', () => {
  it('multiplier', () => {
    expect(dist.NumberUtils.multiplier(1.2)).toBe(10);
    expect(dist.NumberUtils.multiplier(1.2)).toBe(10);
    expect(dist.NumberUtils.multiplier(1.2)).toBe(10);
    expect(dist.NumberUtils.multiplier(1.201)).toBe(1000);
    expect(dist.NumberUtils.multiplier(1)).toBe(1);
  });

  it('correctionFactor', () => {
    expect(dist.NumberUtils.correctionFactor(1, 1)).toBe(1);
    expect(dist.NumberUtils.correctionFactor(1, 1.1)).toBe(10);
    expect(dist.NumberUtils.correctionFactor(1.1, 1.1)).toBe(10);
    expect(dist.NumberUtils.correctionFactor(1.1, 1.101)).toBe(1000);
    expect(dist.NumberUtils.correctionFactor(1.1001, 1.101)).toBe(10000);
  });

  it('add', () => {
    expect(dist.NumberUtils.add(0)).toBe(0);
    expect(dist.NumberUtils.add(0, 0)).toBe(0);
    expect(dist.NumberUtils.add(1000, 10)).toBe(1010);
    expect(dist.NumberUtils.add(0.5, 3)).toBe(3.5);
    expect(dist.NumberUtils.add(-100, 200)).toBe(100);
    expect(dist.NumberUtils.add(0.1, 0.2)).toBe(0.3);
    expect(dist.NumberUtils.add(0.28, 0.01)).toBe(0.29);
    expect(dist.NumberUtils.add(0.289999, 0.000001)).toBe(0.29);
    expect(dist.NumberUtils.add(0.29, 0.01)).toBe(0.3);
  });

  it('sub', () => {
    expect(dist.NumberUtils.sub(0)).toBe(0);
    expect(dist.NumberUtils.sub(0, 0)).toBe(0);
    expect(dist.NumberUtils.sub(1000, 10)).toBe(990);
    expect(dist.NumberUtils.sub(0.5, 3)).toBe(-2.5);
    expect(dist.NumberUtils.sub(-100, 200)).toBe(-300);
    expect(dist.NumberUtils.sub(0.1, 0.2)).toBe(-0.1);
    expect(dist.NumberUtils.sub(0.28, 0.01)).toBe(0.27);
    expect(dist.NumberUtils.sub(0.289999, 0.000001)).toBe(0.289998);
    expect(dist.NumberUtils.sub(0.29, 0.01)).toBe(0.28);
    expect(dist.NumberUtils.sub(3, 2, 1)).toBe(0);
  });

  it('mul', () => {
    expect(dist.NumberUtils.mul(0)).toBe(0);
    expect(dist.NumberUtils.mul(0, 0)).toBe(0);
    expect(dist.NumberUtils.mul(1000, 10)).toBe(10000);
    expect(dist.NumberUtils.mul(0.5, 3)).toBe(1.5);
    expect(dist.NumberUtils.mul(-100, 200)).toBe(-20000);
    expect(dist.NumberUtils.mul(0.1, 0.2)).toBe(0.02);
    expect(dist.NumberUtils.mul(0.28, 0.01)).toBe(0.0028);
    expect(dist.NumberUtils.mul(0.00000231, 10000000)).toBe(23.1);
  });

  it('div', () => {
    expect(dist.NumberUtils.div(0)).toBe(0);
    expect(dist.NumberUtils.div(0, 1)).toBe(0);
    expect(dist.NumberUtils.div(1000, 10)).toBe(100);
    expect(dist.NumberUtils.div(0.5, 3)).toBe(0.16666666666666666);
    expect(dist.NumberUtils.div(-100, 200)).toBe(-0.5);
    expect(dist.NumberUtils.div(5.3, 0.1)).toBe(53);
    expect(dist.NumberUtils.div(0.28, 0.01)).toBe(28);
  });

  it('format', () => {
    expect(dist.NumberUtils.format(1234.56)).toBe('1,235');
    expect(dist.NumberUtils.format(1234.56, 2, ',', ' ')).toBe('1 234,56');
    expect(dist.NumberUtils.format(1234.5678, 2, '.', '')).toBe('1234.57');
    expect(dist.NumberUtils.format(67, 2, ',', '.')).toBe('67,00');
    expect(dist.NumberUtils.format(1000)).toBe('1,000');
    expect(dist.NumberUtils.format(67.311, 2)).toBe('67.31');
    expect(dist.NumberUtils.format(1000.55, 1)).toBe('1,000.6');
    expect(dist.NumberUtils.format(67000, 5, ',', '.')).toBe('67.000,00000');
    expect(dist.NumberUtils.format(0.9, 0)).toBe('1');
    expect(dist.NumberUtils.format('1.20', 2)).toBe('1.20');
    expect(dist.NumberUtils.format('1.20', 4)).toBe('1.2000');
    expect(dist.NumberUtils.format('1.2000', 3)).toBe('1.200');
  });

  it('toCurrency', () => {
    expect(dist.NumberUtils.toCurrency(0)).toBe('0.00');
    expect(dist.NumberUtils.toCurrency(1000)).toBe('1,000.00');
    expect(dist.NumberUtils.toCurrency(1000.5)).toBe('1,000.50');
    expect(dist.NumberUtils.toCurrency(1000.499)).toBe('1,000.50');
    expect(dist.NumberUtils.toCurrency(-1000.499)).toBe('-1,000.50');
  });
});
