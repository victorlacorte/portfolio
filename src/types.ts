// TODO review which types are actually present in the project
// Some of these might make sense only in the src/finance context
export type SimpleDate = {
  year: number;
  month: number;
  day: number;
  toJSDate(): Date;
};

export type Transaction = {
  ticker: string;
  date: SimpleDate;
  quantity: number;
  price: number;
  tax: number;
  // irrf not optional when quantity < 0 i.e. sell transaction
  irrf?: number; // individual income tax?
};

export type PositionEntry = {
  date: Transaction['date'];
  quantity: Transaction['quantity'];
  price: Transaction['price'];
  irrf: Transaction['irrf'];
  soldTotal: number;
  profit: number;
  profitPercent: number;
};

export type Position = {
  [ticker: string]: PositionEntry[];
};

export type Portfolio = {
  position: Position;
  add(t: Transaction): void;
};
