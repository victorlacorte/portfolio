namespace ArrayUtils {
  export function indicesOfSorted<T>(
    arr: T[],
    compareFn = (arr: T[]) => (a: number, b: number) =>
      Number(arr[a]) - Number(arr[b]),
  ): number[] {
    const indices = Array.from({ length: arr.length }, (v, idx) => idx);

    indices.sort(compareFn(arr));
    return indices;
  }

  export function fromIndices<T>(arr: T[], indices: number[]): T[] {
    return indices.map((idx) => arr[idx]);
  }

  export function sameLength(...arrays: any[]): boolean {
    const length = arrays[0].length;

    return arrays.every((arr) => arr.length === length);
  }
}
