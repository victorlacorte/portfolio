/**
 * Return values from `o`, sorted by its keys.
 *
 * @param o object to return values from
 */
export function valuesFrom<T>(o: T): T[keyof T][];

/**
 * Return values from `o`, sorted by its keys. Fill values from `normalizeKeys`
 * missing from `Object.keys(o)` with `defaultValue`
 *
 * @param o object to return values from
 * @param normalizeKeys array of keys to ensure normalized return values
 * @param defaultValue value to fill in for missing keys from `o`
 * @returns
 */
export function valuesFrom<T, U extends string[], V>(
  o: T,
  normalizeKeys: U,
  defaultValue: V,
): (T[keyof T] | V)[];

export function valuesFrom<T, U extends string[], V>(
  o: T,
  normalizeKeys?: U,
  defaultValue?: V,
) {
  return !normalizeKeys.length
    ? Object.keys(o)
        .sort()
        .map<T[keyof T]>((k) => o[k])
    : [...new Set([...Object.keys(o), ...normalizeKeys])]
        .sort()
        .map((k) =>
          Object.prototype.hasOwnProperty.call(o, k) ? o[k] : defaultValue,
        );
}

// function _valuesFrom<T>(o: T): T[keyof T][] {
//   return Object.keys(o)
//     .sort()
//     .map<T[keyof T]>((k) => o[k]);
// }

// function _normalizeValuesFrom<T, U extends string[], V>(
//   o: T,
//   normalizeKeys: U,
//   defaultValue: V,
// ): (T[keyof T] | V)[] {
//   return [...Object.keys(o), ...normalizeKeys]
//     .sort()
//     .map((k) =>
//       Object.prototype.hasOwnProperty.call(o, k) ? o[k] : defaultValue,
//     );
// }
