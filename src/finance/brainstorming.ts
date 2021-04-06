// profit: `irrf` and monthly total from selling
const transactions = {
  mglu3: [
    {
      date: 1,
      quantity: 200,
      price: 1,
      tax: 1,
    },
    {
      date: 2,
      quantity: -100,
      price: 2,
      tax: 1,
      irrf: 1,
    },
    {
      date: 3,
      quantity: 100,
      price: 0.5,
      tax: 1,
    },
  ],
};

const portfolio = {
  mglu3: [
    {
      date: 1,
      quantity: 200,
      price: (200 * 1 + 1) / 200 == 1.005,
    },
    {
      date: 2,
      quantity: 200 - 100 == 100,
      price: 1.005,
      profit: 100 * 2 - 1 - 100 * 1.005 == 98.5,
      profitPercent: (100 * 2 - 1) / (100 * 1.005) - 1 == 0.98,
    },
    {
      date: 3,
      quantity: 100 + 100 == 200,
      price: (100 * 1.005 + 100 * 0.5 + 1) / 200 == 0.7575,
    },
  ],
};

type SimpleDate = {
  year: number;
  month: number;
  day: number;
  toJSDate(): Date;
};

type Transaction = {
  date: SimpleDate;
  quantity: number;
  price: number;
  tax: number;
  irrf?: number; // individual income tax?
};

type PortfolioEntry = {
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

type PortfolioController = {
  portfolio: Portfolio;
  add(t: Transaction): void;
};

declare function averagePrice(t: Transaction): number;
declare function averagePrice(
  t: Transaction,
  quantity: Transaction['quantity'],
  price: Transaction['price'],
): number;

declare function sellTotal(t: Transaction): number;

declare function profit(
  t: Transaction,
  quantity: Transaction['quantity'],
  price: Transaction['price'],
): number;

declare function profitPercent(
  t: Transaction,
  quantity: Transaction['quantity'],
  price: Transaction['price'],
): number;
