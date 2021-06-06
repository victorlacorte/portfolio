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

// export const operations = ['buy', 'sell'] as const;
