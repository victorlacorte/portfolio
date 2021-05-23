import { padStart, toUSD } from 'src/utils/number';
import type { SimpleDate } from 'src/types';

type BuyMessage = {
  date: SimpleDate;
  price: number;
  quantity: number;
};

type SellMessage = {
  profit: number;
} & BuyMessage;

const _toBRLDate = (date: SimpleDate): string =>
  `${padStart(date.day, 2)}/${padStart(date.month, 2)}`;

export const buyMessage = ({ date, price, quantity }: BuyMessage): string =>
  `${_toBRLDate(date)}: ${quantity} compradas, R$${toUSD(price)}/ação`;

export const sellMessage = ({
  date,
  quantity,
  price,
  profit,
}: SellMessage): string =>
  `${_toBRLDate(date)}: ${quantity} vendidas, R$${toUSD(price)}/ação, ${
    profit > 0
      ? `lucro de R$${toUSD(profit)}`
      : `prejuízo de R$${toUSD(Math.abs(profit))}`
  }`;
