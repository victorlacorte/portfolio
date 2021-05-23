import { makeBuyEntry, makeSellEntry, sortByDate, year } from './__mocks__';
import { formatEntries, lastEntryFromYear, relevantEntries } from './functions';

describe('finance/irpf/functions', () => {
  describe('relevantEntries', () => {
    test('happy flow: all entries are relevant', () => {
      expect(relevantEntries(year, [])).toEqual([]);

      const entries = Array.from({ length: 3 }, (_, index) =>
        makeBuyEntry({ day: index + 1 }),
      );

      expect(sortByDate(relevantEntries(year, entries))).toEqual(
        sortByDate(entries),
      );
    });

    test('some entries are excluded', () => {
      const entries = Array.from({ length: 3 }, (_, index) =>
        makeBuyEntry({ year: year + index }),
      );

      expect(relevantEntries(year, entries)).toEqual([entries[0]]);

      expect(sortByDate(relevantEntries(year + 1, entries))).toEqual(
        sortByDate(entries.slice(0, -1)),
      );
    });

    test('closed position entries prior to (and including) year - 1 are excluded', () => {
      const entries = [
        makeBuyEntry({ year: year - 2 }),
        makeBuyEntry({ year: year - 2 }),
        makeBuyEntry({ year: year - 2 }),
        makeSellEntry({ year: year - 1, quantity: 0 }),
        makeBuyEntry(),
      ];

      expect(relevantEntries(year, entries)).toEqual([
        entries[entries.length - 1],
      ]);

      expect(sortByDate(relevantEntries(year - 1, entries))).toEqual(
        sortByDate(entries.slice(0, -1)),
      );
    });
  });

  describe('lastEntryFromYear', () => {
    test('works as expected', () => {
      expect(lastEntryFromYear(year, [])).toBeUndefined();
      expect(lastEntryFromYear(year + 1, [])).toBeUndefined();

      const entries = [
        makeBuyEntry({ year: 2020 }),
        makeBuyEntry({ year: 2021 }),
        makeBuyEntry({ year: 2022 }),
      ];

      [2020, 2021, 2022].forEach((y) => {
        expect(lastEntryFromYear(y, entries)).toEqual(
          makeBuyEntry({ year: y }),
        );
      });
    });
  });

  describe('formatEntries', () => {
    test('works as expected', () => {
      const entries = [makeBuyEntry(), makeSellEntry()];
      expect(formatEntries(entries)).toMatchSnapshot();
    });
  });
});
