import { MyOctokit } from './MyOctokit'
import {
  SecretScanningAlert,
  SecretScanningLocation,
  Matches
} from './types/common/main.d'
import * as core from '@actions/core'

export const fetchSecretScanningAlerts = async (
  octokit: InstanceType<typeof MyOctokit>,
  owner: string,
  repo: string
): Promise<SecretScanningAlert[]> => {
  try {
    const alerts = (await octokit.paginate(
      octokit.rest.secretScanning.listAlertsForRepo,
      {
        owner,
        repo,
        per_page: 100
      }
    )) as SecretScanningAlert[]

    for (const alert of alerts) {
      const locations = (await octokit.paginate(
        octokit.rest.secretScanning.listLocationsForAlert,
        {
          owner,
          repo,
          alert_number: alert.number,
          per_page: 100
        }
      )) as SecretScanningLocation[]
      alert.locations = locations
      alert.totalLocations = locations.length
    }

    return alerts
  } catch (error) {
    core.setFailed(`Error fetching secret scanning alerts: ${String(error)}`)
    return []
  }
}

export const mapSecretScanningAlerts = (
  originalAlerts: SecretScanningAlert[],
  targetAlerts: SecretScanningAlert[]
): Matches[] => {
  const matchesList: Matches[] = []

  for (const originalAlert of originalAlerts) {
    for (const targetAlert of targetAlerts) {
      const isSecretTypeMatch =
        targetAlert.secret_type === originalAlert.secret_type
      const isSecretMatch = targetAlert.secret === originalAlert.secret
      const isLocationCountMatch =
        (targetAlert.totalLocations || 0) ===
        (originalAlert.totalLocations || 0)
      const isStateMatch = targetAlert.state === originalAlert.state

      const isMatch = isSecretTypeMatch && isSecretMatch && isLocationCountMatch

      if (isMatch) {
        const updatedAlert: SecretScanningAlert = {
          ...targetAlert,
          state: originalAlert.state,
          resolution: originalAlert.resolution,
          resolution_comment:
            '[sync] ' +
            (originalAlert.resolution_comment || '') +
            ' # closed by: ' +
            (originalAlert.resolved_by?.login || '')
        }

        matchesList.push({
          originalAlert,
          targetAlert,
          updatedAlert,
          isSecretTypeMatch,
          isSecretMatch,
          isLocationCountMatch,
          isStateMatch
        })
      }
    }
  }

  return matchesList
}

export const updateSecretScanningAlerts = async (
  matches: Matches[],
  targetOctokit: InstanceType<typeof MyOctokit>,
  owner: string,
  repo: string,
  dryRun: boolean
): Promise<void> => {
  for (const match of matches) {
    if (!match.isStateMatch) {
      const alert = match.updatedAlert

      core.info(
        `Updating alert #${alert.number} state from '${match.targetAlert.state}' to '${alert.state}'`
      )

      if (!dryRun) {
        await targetOctokit.rest.secretScanning.updateAlert({
          owner,
          repo,
          alert_number: alert.number,
          state: alert.state,
          resolution: alert.resolution,
          resolution_comment: alert.resolution_comment
        })
      } else {
        core.info('Dry run: Would update alert ' + alert.number)
      }
    }
  }
}
