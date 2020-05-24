namespace Constants {
  export const messages = {
    invalidSellQty:
      'Invalid sell quantity: available total is less than the purchased one',
    diffLengthNR: 'Named ranges contain different non-empty cells',
  };

  export const genericError = (
    expected: any,
    received: any,
    line?: number,
  ): Error =>
    new Error(
      `${
        line && `[Line ${line}] `
      }Expected "${expected}" but got "${received}" instead`,
    );

  export const ssOperations = {
    buy: 'd',
    sell: 'c',
  };

  export const validOperations = Object.values(ssOperations);
}
