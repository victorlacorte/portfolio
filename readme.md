# Google Sheets Portfolio

## Custom spreadsheet deployment

The current CD will deploy to a Spreadsheet generated with secrets from the repository, so in order
to deploy to a custom one proceed as follows:

- Create a file named `.clasp.json` in the root with the desired
  [`scriptId`](https://github.com/google/clasp/#scriptid-required)

- `npm run validate && npm run clasp:push`

## Open questions

- Does migrating to the newly supported
  [V8 engine](https://developers.google.com/apps-script/guides/v8-runtime) bring any
  inconsistencies?

## TODO

- There are certain business rules that must be enforced:

  - selling a ticker and rebuying it in the same day is not valid, but the opposite is

- The snapshot feature still needs tuning in order to easily aid during tax declarations e.g. "NA
  entries" should be removed drom such snapshots since they are mostly useless for this goal.
