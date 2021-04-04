type SimpleDate = {
  year: number;
  month: number;
  day: number;
  toJSDate(): Date;
};

export type Transaction = {
  date: SimpleDate;
  quantity: number;
  price: number;
  tax: number;
  irrf?: number; // individual income tax?
};

export type PortfolioEntry = {
  date: SimpleDate;
  quantity: Transaction['quantity'];
  price: Transaction['price'];
};

type PortfolioSellEntry = {
  profit: number;
  profitPercent: number;
} & PortfolioEntry;

type Portfolio = {
  [ticker: string]: (PortfolioEntry | PortfolioSellEntry)[];
};

export type PortfolioController = {
  portfolio: Portfolio;
  add(t: Transaction): void;
};
