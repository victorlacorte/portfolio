// Enforce consistent ordering
export const valuesFrom = <T extends {}>(o: T) =>
  Object.keys(o)
    .sort()
    .map<T[keyof T]>((k) => o[k]);
