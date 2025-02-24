# Map GitHub Advanced Security (GHAS) alert state between repository copies

This action is designed to be used to map GHAS alerts between original
repository and a copy of it. It will update the GHAS alert state of the target
repository to match the original repository.

The action is designed to be used in a workflow that is triggered either
manually or by a schedule.

The primary use case for this is when you are migrating a repository from one
organization to another, and you want to ensure that the GHAS alert state is
consistent between the original repository and the new repository. This avoids
the need for repository owners/maintainers to go over already triaged and
resoled alerts.

## Inputs

- `original_repository` (required): Full name of the original repository -
  organization/repository.
- `original_endpoint` (optional, default: `https://api.github.com`): Endpoint
  for the original repository.
- `original_token` (required): GitHub Access Token for the original repository.
- `target_repository` (required): Full name of the target repository -
  organization/repository.
- `target_endpoint` (optional, default: `https://api.github.com`): Endpoint for
  the target repository.
- `target_token` (required): GitHub Access Token for the target repository.
- `dry_run` (required, default: `true`): Dry run the action without making any
  changes.
- `alert_types` (optional, default: `all`): Comma separated list of alert types
  to process. Valid values are `all`, `secret-scanning`, `code-scanning`, and
  `dependabot`.
- `matchinglevel` (optional, default: `exact`): Valid values are `exact` or
  `loose`.

:warning: The `code-scanning` and `dependabot` alert types are not supported
yet.

## Outputs

- `report_file`: The path to the report file that contains the results of the
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

- Matching level`exact`: The alerts are a match when the following criteria are
  met:
  - The secret provider is the same.
  - The secret type is the same.
  - The secret itself is the same.
  - The number of locations where the secret is found is the same.
- Matching level `loose`: The alerts are a match when the following criteria are
  met:
  - The secret provider is the same.
  - The secret type is the same.
  - The secret itself is the same.

#### Code Scanning Alerts

:warning: TODO: NOT SUPPORTED YET!

#### Dependabot Alerts

:warning: TODO: NOT SUPPORTED YET!

## Development Setup

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
   ...
   ```

## Validate the Action Locally

You can use the `local-action` command to run the action locally.

1. Edit .env file and add the required inputs. You can copy the .env.example
   file and update the values as needed.

2. Run the action locally

```bash
npx local-action . src/main.ts .env
```

## Use the Action in a Workflow

You can use the action in a workflow in any repository. The following is an
example of a workflow that uses the action:

```yaml
name: Update GHAS alert state

...

jobs:
  update_ghas_alert_state:
    runs-on: ubuntu-latest
    steps:

      ...

      - name: Update GHAS alert state
        id: update_ghas_alert_state
        uses: theztefan/ghas-alert-mapper@main
        with:
          original_repository: octocat/original-repo
          original_token: ${{ secrets.ORIGINAL_TOKEN }}
          target_repository: octocat/target-repo
          target_token: ${{ secrets.TARGET_TOKEN }}
          dry_run: 'false'
          alert_types: 'secret scanninge'
```
