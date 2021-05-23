import SimpleDate from 'src/utils/date';
import type {
  BaseEntry,
  BuyEntry,
  PositionEntry,
  SellEntry,
  SimpleDate as _SimpleDate,
} from 'src/types';

type SortByDate = (entries: PositionEntry[]) => PositionEntry[];

type EntryProperties<T> = Partial<Omit<BaseEntry, 'date'> & T & YMD>;
type MakeEntry<T> = (properties?: EntryProperties<T>) => T & BaseEntry;

type MakeBuyEntry = MakeEntry<BuyEntry>;
type MakeSellEntry = MakeEntry<SellEntry>;

type YMD = {
  year: number;
  month: number;
  day: number;
};

// The year itself does not matter but will dictate all calculations
export const year = 2020;

const defaultBuyEntry: Required<EntryProperties<BuyEntry>> = {
  year: 2020,
  month: 1,
  day: 1,
  price: 1,
  quantity: 1,
  buyQuantity: 100,
  buyTotal: 100,
};

const defaultSellEntry: Required<EntryProperties<SellEntry>> = {
  year: 2020,
  month: 1,
  day: 1,
  price: 1,
  quantity: 1,
  sellQuantity: 100,
  sellIrrf: 1,
  sellProfit: 1,
  sellProfitPercent: 0.1,
  sellTotal: 100,
};

export const makeBuyEntry: MakeBuyEntry = ({
  year,
  month,
  day,
  ...properties
} = {}) => ({
  ...defaultBuyEntry,
  ...properties,
  date: SimpleDate.make(
    year ?? defaultBuyEntry.year,
    month ?? defaultBuyEntry.month,
    day ?? defaultBuyEntry.day,
  ),
});

export const makeSellEntry: MakeSellEntry = ({
  year,
  month,
  day,
  ...properties
} = {}) => ({
  ...defaultSellEntry,
  ...properties,
  date: SimpleDate.make(
    year ?? defaultBuyEntry.year,
    month ?? defaultBuyEntry.month,
    day ?? defaultBuyEntry.day,
  ),
});

export const sortByDate: SortByDate = (x) =>
  x.sort((a, b) => Number(a.date.toJSDate()) - Number(b.date.toJSDate()));
