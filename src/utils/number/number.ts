import * as R from 'ramda';

type DecimalAdjust = (x: number, digits?: number) => number;

// mostly adapted from https://github.com/adamwdraper/Numeral-js/blob/master/src/numeral.js

// https://stackoverflow.com/a/48764436

function isRound(x: number, digits: number): boolean {
  const p = Math.pow(10, digits);

  return Math.round(x * p) / p === x;
}

function _decimalAdjust(type: keyof Math, x: number, digits = 0): number {
  if (isRound(x, digits)) return x;

  const p = Math.pow(10, digits);
  const m = x * p * (1 + Number.EPSILON);

  return Math[type as string](m) / p;
}

const decimalAdjust = R.curry(_decimalAdjust);

const round: DecimalAdjust = decimalAdjust('round');

export const trunc: DecimalAdjust = decimalAdjust('trunc');

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
export function correctionFactor(...arguments_: number[]): number {
  return arguments_.reduce((accumulator, current) => {
    const currentMultiplier = multiplier(current);

    return accumulator > currentMultiplier ? accumulator : currentMultiplier;
  }, 1);
}

export function add(...arguments_: number[]): number {
  const corrFactor = correctionFactor(...arguments_);

  return (
    arguments_.reduce(
      (accumulator, current) => accumulator + round(corrFactor * current),
      0,
    ) / corrFactor
  );
}

export function sub(...arguments_: number[]): number {
  const [first, ...rest] = arguments_;

  return add(first, ...rest.map((number) => -number));
}

export function mul(...arguments_: number[]): number {
  return arguments_.reduce((accumulator, current) => {
    const corrFactor = correctionFactor(accumulator, current);

    return (
      (round(corrFactor * accumulator) * round(corrFactor * current)) /
      round(corrFactor ** 2)
    );
  }, 1);
}

export function div(...arguments_: number[]): number {
  return arguments_.reduce((accumulator, current) => {
    const corrFactor = correctionFactor(accumulator, current);

    return round(corrFactor * accumulator) / round(corrFactor * current);
  });
}

/**
 * Possibly unnecessary:
 * numObj.toFixed([digits])
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed#Description
 */
// export function toFixed(x: number, precision: number): number {
//   const k = Math.pow(10, precision);

//   return Math.round(x * k) / k;
// }

/**
 * Possibly redundant: numObj.toLocaleString('en-US', { style: 'currency', currency: 'USD' }).slice(1)
 */
// export function format(
//   x: number,
//   decimals = 0,
//   decimalSeparator = '.',
//   thousandsSeparator = ',',
// ): string {
//   if (!isFinite(x)) {
//     throw new Error(expectedFinite(x));
//   }

//   if (!isFinite(decimals)) {
//     throw new Error(expectedFinite(decimals));
//   }

//   const prec = Math.abs(decimals);
//   const numAsStr = toFixed(x, prec).toString().split('.');

//   if (numAsStr[0].length > 3) {
//     numAsStr[0] = numAsStr[0].replace(
//       /\B(?=(?:\d{3})+(?!\d))/g,
//       thousandsSeparator,
//     );
//   }

//   if ((numAsStr[1] || '').length < prec) {
//     numAsStr[1] = numAsStr[1] || '';
//     numAsStr[1] += new Array(prec - numAsStr[1].length + 1).join('0');
//   }

//   return numAsStr.join(decimalSeparator);
// }

/**
 * Returns `x` formatted in en-US USD notation.
 *
 * @param x a numeric expression to be formatted as a currency amount
 */
export function toUSD(x: number): string {
  const formatted = Math.abs(x)
    .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    .slice(1);

  return x >= 0 ? formatted : `-${formatted}`;
}

export function padStart(
  x: number,
  maxLength: number,
  fillString = '0',
): string {
  return String(x).padStart(maxLength, fillString);
}

/**
 * Returns `x` truncated to a maximum of `digits` decimal numbers.
 *
 * @param x A numeric expression
 * @param digits The maximum number of decimal digits
 */
// export function trunc(x: number, digits = 0): number {
//   const power = Math.pow(10, digits);

//   return Math.trunc(x * power) / power;
// }
