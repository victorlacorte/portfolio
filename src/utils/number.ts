import { expectedFinite } from 'src/utils/messages';

// mostly copied from https://github.com/adamwdraper/Numeral-js/blob/master/src/numeral.js

/**
 * Computes the multiplier necessary to make x >= 1, effectively eliminating
 * miscalculations caused by finite precision.
 */
export function multiplier(x: number): number {
  const parts = x.toString().split('.');

  return parts.length < 2 ? 1 : Math.pow(10, parts[1].length);
}

/**
 * Given a variable number of arguments, returns the maximum multiplier that
 * must be used to normalize an operation involving all of them.
 */
export function correctionFactor(...args: number[]): number {
  return args.reduce((acc, curr) => {
    const currMultiplier = multiplier(curr);

    return acc > currMultiplier ? acc : currMultiplier;
  }, 1);
}

export function add(...args: number[]): number {
  const corrFactor = correctionFactor(...args);

  return (
    args.reduce((acc, curr) => acc + Math.round(corrFactor * curr), 0) /
    corrFactor
  );
}

export function sub(...args: number[]): number {
  const [first, ...rest] = args;

  return add(first, ...rest.map((num) => -num));
}

export function mul(...args: number[]): number {
  return args.reduce((acc, curr) => {
    const corrFactor = correctionFactor(acc, curr);

    return (
      (Math.round(corrFactor * acc) * Math.round(corrFactor * curr)) /
      Math.round(corrFactor ** 2)
    );
  }, 1);
}

export function div(...args: number[]): number {
  return args.reduce((acc, curr) => {
    const corrFactor = correctionFactor(acc, curr);

    return Math.round(corrFactor * acc) / Math.round(corrFactor * curr);
  });
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed#Description
 */
export function toFixed(x: number, precision: number): number {
  const k = Math.pow(10, precision);

  return Math.round(x * k) / k;
}

export function format(
  x: number,
  decimals = 0,
  decimalSeparator = '.',
  thousandsSeparator = ',',
): string {
  if (!isFinite(x)) {
    throw new Error(expectedFinite(x));
  }

  if (!isFinite(decimals)) {
    throw new Error(expectedFinite(decimals));
  }

  const prec = Math.abs(decimals);
  const numAsStr = toFixed(x, prec).toString().split('.');

  if (numAsStr[0].length > 3) {
    numAsStr[0] = numAsStr[0].replace(
      /\B(?=(?:\d{3})+(?!\d))/g,
      thousandsSeparator,
    );
  }

  if ((numAsStr[1] || '').length < prec) {
    numAsStr[1] = numAsStr[1] || '';
    numAsStr[1] += new Array(prec - numAsStr[1].length + 1).join('0');
  }

  return numAsStr.join(decimalSeparator);
}

export function toCurrency(x: number): string {
  return format(x, 2, '.', ',');
}

export function padStart(x: number, places: number, fillString = '0'): string {
  return String(x).padStart(places, fillString);
}
