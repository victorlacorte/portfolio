namespace NamedRangeUtils {
  export function sanitizeCol<T>(nrCol: T[][]): T[] {
    return nrCol
      .flat()
      .filter((val) => val !== undefined && val.toString().length);
  }

  export function sanitize(...namedRanges: any[][][]): any[][] {
    const sanitized = [];

    namedRanges.forEach((namedRange) => {
      sanitized.push(sanitizeCol(namedRange));
    });

    if (!ArrayUtils.sameLength(...sanitized)) {
      throw new Error(Constants.messages.diffLengthNR);
    }

    return [...sanitized];
  }
}
