describe('src/utils/array', () => {
  it('indicesOfSorted', () => {
    const input = [
      [
        [1, 2, 3],
        [0, 1, 2],
      ],
      [
        [3, 2, 1],
        [2, 1, 0],
      ],
    ];

    input.forEach(([arr, indices]) => {
      expect(dist.ArrayUtils.indicesOfSorted(arr)).toEqual(indices);
    });
  });

  it('fromIndices', () => {
    const input = [
      [
        [1, 2, 3],
        [0, 1, 2],
      ],
      [
        [1, 3, 2],
        [0, 2, 1],
      ],
      [
        [3, 2, 1],
        [2, 1, 0],
      ],
    ];
    input.forEach(([arr, indices]) => {
      expect(dist.ArrayUtils.fromIndices(arr, indices)).toEqual(arr.sort());
    });
  });

  it('sorts an array based on the indices required for the array to be sorted (ascending)', () => {
    const input = [
      [1, 2, 3],
      [1, 3, 2],
      [2, 1, 3],
      [2, 3, 1],
      [3, 1, 2],
      [3, 2, 1],
    ];

    input.forEach((arr) => {
      const indices = dist.ArrayUtils.indicesOfSorted(arr);
      expect(dist.ArrayUtils.fromIndices(arr, indices)).toEqual(arr.sort());
    });
  });

  it('sameLength', () => {
    expect(dist.ArrayUtils.sameLength([1, 2, 3], ['foo', 'bar', 'baba'])).toBe(
      true,
    );
    expect(dist.ArrayUtils.sameLength([1, 2], ['foo', 'bar', 'baba'])).toBe(
      false,
    );
  });
});
