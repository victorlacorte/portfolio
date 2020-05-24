namespace NumberUtils {
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

  export function toFixed(x: number, precision: number): number {
    const k = Math.pow(10, precision);

    return Math.round(x * k) / k;
  }

  export function format(
    x: number,
    decimals: number,
    decimalSeparator?: Types.Separator,
    thousandsSeparator?: Types.Separator,
  ): string {
    const num = !isFinite(x) ? 0 : x,
      prec = !isFinite(decimals) ? 0 : Math.abs(decimals),
      dec = typeof decimalSeparator === 'undefined' ? '.' : decimalSeparator,
      sep =
        typeof thousandsSeparator === 'undefined' ? ',' : thousandsSeparator,
      numAsStr = (prec ? toFixed(num, prec) : Math.round(num))
        .toString()
        .split('.');

    if (numAsStr[0].length > 3) {
      numAsStr[0] = numAsStr[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }

    if ((numAsStr[1] || '').length < prec) {
      numAsStr[1] = numAsStr[1] || '';
      numAsStr[1] += new Array(prec - numAsStr[1].length + 1).join('0');
    }

    return numAsStr.join(dec);
  }

  export function toCurrency(x: number): string {
    return format(x, 2, '.', ',');
  }

  export function padStart(
    x: number,
    places: number,
    fillString = '0',
  ): string {
    return String(x).padStart(places, fillString);
  }
}
