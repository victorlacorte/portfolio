// export const columnNames = [
//   'year',
//   'month',
//   'day',
//   'ticker',
//   'operation',
//   'quantity',
//   'price',
//   'tax',
//   'irrf',
// ] as const;

export const buyEntryKeys = ['buyQuantity', 'buyTotal'] as const;

export const sellEntryKeys = [
  'sellIrrf',
  'sellQuantity',
  'sellTotal',
  'sellProfit',
  'sellProfitPercent',
] as const;

export const positionColumnNames = [
  'date',
  'quantity',
  'price',
  ...buyEntryKeys,
  ...sellEntryKeys,
];

export const transactionKinds = [
  'buy',
  'sell',
  'split',
  'reverse split',
  'stock dividend',
] as const;

// export const operations = ['buy', 'sell'] as const;
