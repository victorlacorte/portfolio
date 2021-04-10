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

export type PortfolioEntry = {
  date: SimpleDate;
  quantity: Transaction['quantity'];
  price: Transaction['price'];
};

export type PortfolioSellEntry = {
  profit: number;
  profitPercent: number;
} & PortfolioEntry;

export type Portfolio = {
  [ticker: string]: (PortfolioEntry | PortfolioSellEntry)[];
};

export type PortfolioWrapper = {
  portfolio: Portfolio;
  add(t: Transaction): void;
};
