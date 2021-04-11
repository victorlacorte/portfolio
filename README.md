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
