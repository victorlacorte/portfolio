// "Public" functions should be outside namespaces
// TODO remeber that closedPosition should account for dividends paid after
// the position was closed
interface Finance {
  profit(): void;
  ongoingTickers(): void;
  closedPosition(): void;
  cashDividend(): void;
}
