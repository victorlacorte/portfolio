# Google Sheets Portfolio Management

## Custom spreadsheet deployment

The CD pipeline is configured to deploy to a particular spreadsheet, specified
with secrets `CLASP_AUTH` and `CLASP_ID`. In order to deploy to a custom one,
proceed as follows:

- `clasp login` (or have an authorization file `.clasprc.json` present)

- Create a file named `.clasp.json` in the root dir with the desired
  [`scriptId`](https://github.com/google/clasp/#scriptid-required)

- `npm run validate && npm run build && npm run clasp:push`

## Webpack and Apps Script details

`src/api.js` exposes all functions callable from the spreadsheet. Notice it
accesses the `Portfolio` variable created during
[build](https://webpack.js.org/configuration/output/#expose-a-variable): this
was the simplest workaround to the fact that, currently, Google Apps Script
requires all functions to be _explicitly_ present in the generated `*.gs` files
(e.g. exposing the entry point via object assignment, `type: this`, does not
work).

In the future, this file could be transpiled separately and the `Portfolio`
variable could be type checked in order to provide a better usage experience.

## Brainstorming

### IRPF

- Let Y be the calculation ("calendar") year: we need to keep track of movements
in Y - 1 and Y;

transactions => reduce to relevant ones (given the calculation year) => ~~merge
repeated operations on the same date~~ => sort by type of operation => sort by
date => quantity > 0 && quantity => reduce each transaction to a template
message

Reduce to relevant transactions:

- Remove entry e if `e.year > Y`
- Remove entry e and previous ones (sorted ascending by date) if `e.quantity == 0` and `e.year <= Y -  1`
 - Note: it is easier to remove subsequent entries by sorting descending

Notes:

- Specify owned ticker's quantities when they are bigger than 0 in December 31st of Y;
- Specify owned value in Y - 1;
- Specify owned value in Y.

~~Perform another pass in the transactions array to merge same operations on the same date~~:
- `average price = (total0 + total1) / (quantity0 + quantity1)`

The above was not conducted since it might not improve the result/report


### TODO

- How to represent stock splits ("desdobramento") or reverse stock splits
(inplit? "grupamento")? It seems easy enough in the position but harder in the
transaction sheet

## Glossary

IRRF: individual income tax
