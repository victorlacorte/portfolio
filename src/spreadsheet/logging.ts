import type { Transaction } from 'src/types';

import { div, format, toCurrency, toFixed } from '../utils/number';

type ProfitMessage = {
  profit: number;
  purchasedValue: number;
  total: number;
} & Omit<Transaction, 'averagePrice' | 'operation' | 'transactionTax'>;

export function profitMessage(params: ProfitMessage): string {
  const ticker = params.ticker.toUpperCase();
  const quantity = format(params.quantity);
  const total = toCurrency(params.total);
  const profit = toCurrency(params.profit);
  const taxDeduction = toCurrency(params.taxDeduction);
  const profitPercent = toFixed(
    div(params.profit, params.purchasedValue) * 100,
    2,
  );

  return `${params.date}: [${ticker}] quantity=${quantity}, total=${total}, profit=${profit} (${profitPercent}%), tax=${taxDeduction}`;
}

type SnapshotMessage = Omit<
  Transaction,
  'ticker' | 'taxDeduction' | 'transactionTax'
>;

// We don't need to include the ticker since it is the key of this kind of message
export function snapshotMessage(params: SnapshotMessage): string {
  const operation = params.operation.toUpperCase();
  const quantity = format(params.quantity);
  const averagePrice = toCurrency(params.averagePrice);
  const total = toCurrency(params.total);

  return `${params.date}: [${operation}] ${quantity} stocks for ${total} (${averagePrice})`;
}
