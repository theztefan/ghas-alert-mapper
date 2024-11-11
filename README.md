# Map GitHub Advanced Security (GHAS) alert state between repository copies

This action is designed to be used to map GHAS alerts between original
repository and a copy of it. It will update the GHAS alert state of the target
repository to match the original repository.

The action is designed to be used in a workflow that is triggered either
manually or by a schedule.

The primary use case for this is when you are migrating a repository from one
organization to another, and you want to ensure that the GHAS alert state is
consistent between the original repository and the new repository. This avoids
the need for repository owners/maintainers to re-analyze already triaged and
resoled alerts.

## Inputs

- `original-repository` (required): Full name of the original repository -
  organization/repository.
- `original-endpoint` (optional, default: `https://api.github.com`): Endpoint
  for the original repository.
- `original-token` (required): GitHub Access Token for the original repository.
- `target-repository` (required): Full name of the target repository -
  organization/repository.
- `target-endpoint` (optional, default: `https://api.github.com`): Endpoint for
  the target repository.
- `target-token` (required): GitHub Access Token for the target repository.
- `dry-run` (required, default: `true`): Dry run the action without making any
  changes.
- `alert-types` (optional, default: `all`): Comma separated list of alert types
  to process. Valid values are `all`, `secret-scanning`, `code-scanning`, and
  `dependabot`.

## Outputs

- `report-file`: The path to the report file that contains the results of the
  action. This file will be in the `reports` directory of the repository.

## How does it work?

1. The action works by first getting a list of all the GHAS alerts in the
   original repository.
2. It then gets a list of all the GHAS alerts in the target repository.
3. It then compares the two lists of alerts and identifies the matches. The
   matching works differently per alert type. Documented in the
   [Matching Alert Criteria](#matching-alert-criteria) section.
4. For each match, it updates the state of the alert in the target repository to
   match the state of the alert in the original repository. The state is
   determined by the `state` property of the alert. The valid states are `open`,
   `resolved`, and `dismissed`.

- If the state of the alert in the original repository is different from the
  state of the alert in the target repository, the action will update the state
  of the alert in the target repository to match the state of the alert in the
  original repository.
- If the state of the alert in the original repository is the same as the state
  of the alert in the target repository, the action will do nothing.

### Matching Alert Criteria

#### Secret Scannig Alerts

The alerts are a match when the following criteria are met:

- The secret provider is the same.
- The secret type is the same.
- The secret itself is the same.
- The number of locations where the secret is found is the same.

#### Code Scanning Alerts

TODO

#### Dependabot Alerts

TODO

## Local Setup and development Initial Setup

After you've cloned the repository to your local machine or codespace, you'll
need to perform some initial setup steps before you can develop your action.

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

1. :building_construction: Package the TypeScript for distribution

   ```bash
   npm run bundle
   ```

1. :white_check_mark: Run the tests

   ```bash
   $ npm test

   PASS  ./index.test.js
     ✓ throws invalid number (3ms)
     ✓ wait 500 ms (504ms)
     ✓ test runs (95ms)

   ...
   ```

## Validate the Action

```yaml
steps:
  - name: Test Local Action
    id: test-action
    uses: ./
    with:
      original-repository: ${{ github.repository }}
      original-token: ${{ secrets.ORIGIN_GITHUB_TOKEN }}
      target-repository: ${{ github.repository }}
      target-token: ${{ secrets.DESTINATIONGITHUB_TOKEN }}
      dry-run: true
      alert-types: secret-scanning

  - name: Print Output
    id: output
    run: echo "${{ steps.test-action.outputs.report-file }}"
```
