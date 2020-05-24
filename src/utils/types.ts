namespace Types {
  export type ParsedDate = {
    year: number;
    month: number;
    day: number;
  };

  export type Separator = '.' | ',';

  export type Stats = {
    [ticker: string]: {
      purchased: {
        qty: number;
        total: number;
      };
      sold: {
        qty: number;
        total: number;
      };
    };
  };
}
