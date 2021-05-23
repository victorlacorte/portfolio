import { div, mul } from 'src/utils/number';
import type { Position, PositionEntry } from 'src/types';

import { buyMessage, sellMessage } from './messages';

// sort descending to remove subsequent entries
// year and year - 1
export function relevantEntries(
  year: number,
  entries: PositionEntry[],
): PositionEntry[] {
  const filtered = entries
    .filter((e) => e.date.year <= year)
    .sort((a, b) => Number(b.date.toJSDate()) - Number(a.date.toJSDate()));

  const relevant: PositionEntry[] = [];

  // for (let i = 0; i < relevant.length; i++) {
  //   const curr = relevant[i];

  //   if (curr.quantity == 0 && curr.date.year <= year - 1) {
  //     return ret;
  //   }

  //   ret.push(curr);
  // }
  for (const e of filtered) {
    if (e.quantity == 0 && e.date.year <= year - 1) {
      return relevant.filter((e) => e.date.year == year);
    }

    relevant.push(e);
  }

  return relevant;
}

// const mergeEntries = (entries: PositionEntry[]) => {
//   const sorted = entries.sort(
//     (a, b) => Number(a.date.toJSDate) - Number(b.date.toJSDate()),
//   );
//   const ret = [];

//   for (let i = 0; i < sorted.length - 1; i++) {
//     if (
//       sorted[i].date.equals(sorted[i + 1].date) &&
//       ((sorted[i].buyQuantity && sorted[i + 1].buyQuantity) ||
//         (sorted[i].sellQuantity && sorted[i + 1].sellQuantity))
//     ) {
//       if (sorted[i].buyQuantity) {
//         // const [popped0] = sorted.splice(i, 1);
//         // const [popped1] = sorted.splice(i, 1); // splice mutates the array so i calc also changes

//       } else {
//       }
//       const popped = sorted;
//       i++;
//     }
//   }
// };

export function formatEntries(
  entries: PositionEntry[],
  separator = '\n',
): string {
  return entries
    .map((e) =>
      e.buyQuantity
        ? buyMessage({
            date: e.date,
            price: div(e.buyTotal, e.buyQuantity),
            quantity: e.buyQuantity,
          })
        : sellMessage({
            date: e.date,
            price: div(e.sellTotal, e.sellQuantity),
            profit: e.sellProfit,
            quantity: e.sellQuantity,
          }),
    )
    .join(separator);
}

/**
 * Sort entries descending and return the first one that satisfies
 * entry.date.year <= year or `undefined` if none are found
 *
 * @param year
 * @param entries
 */
export function lastEntryFromYear(
  year: number,
  entries: PositionEntry[],
): PositionEntry | undefined {
  const sorted = entries.sort(
    (a, b) => Number(b.date.toJSDate()) - Number(a.date.toJSDate()),
  );

  for (const e of sorted) {
    if (e.date.year <= year) {
      return e;
    }
  }
}
// Obtain:
// Value in Y - 1
// Value in Y
// Amount owned in Y
export function irpf(year: number, entries: PositionEntry[]) {
  const relevant = relevantEntries(year, entries);
  const lastFromYear = lastEntryFromYear(year, relevant);
  const lastFromPrevYear = lastEntryFromYear(year - 1, relevant);

  return {
    [year]: lastFromYear
      ? `${lastFromYear.quantity}, ${mul(
          lastFromYear.price,
          lastFromYear.quantity,
        )}`
      : 0,
    [year - 1]: lastFromPrevYear
      ? mul(lastFromPrevYear.price, lastFromPrevYear.quantity)
      : 0,
    log: formatEntries(
      relevant
        // .filter((e) => e.date.year == year)
        .sort((a, b) => Number(a.date.toJSDate()) - Number(b.date.toJSDate())),
    ),
  };
}
