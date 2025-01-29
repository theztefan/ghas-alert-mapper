import * as core from '@actions/core'
import { MyOctokit } from './MyOctokit'
import {
  fetchSecretScanningAlerts,
  mapSecretScanningAlerts,
  updateSecretScanningAlerts
} from './SecretScanning.js'
import { generateReport, saveReport } from './Report'
import { Matches } from './types/common/main.d'

export async function run(): Promise<void> {
  try {
    // Inputs
    const originalRepository = core.getInput('original_repository', {
      required: true
    })
    const originalEndpoint =
      core.getInput('original_endpoint') || 'https://api.github.com'
    const originalToken = core.getInput('original_token', { required: true })
    const targetRepository = core.getInput('target_repository', {
      required: true
    })
    const targetEndpoint =
      core.getInput('target-endpoint') || 'https://api.github.com'
    const targetToken = core.getInput('target_token', { required: true })
    const dryRun = core.getBooleanInput('dry_run', { required: true })
    const alertTypesInput = core.getInput('alert_types') || 'all'

    const alertTypes = alertTypesInput.split(',').map(s => s.trim())

    // Octokit instances
    const [originalOwner, originalRepo] = originalRepository.split('/')
    const [targetOwner, targetRepo] = targetRepository.split('/')

    const OriginalOctokit = new MyOctokit({
      auth: originalToken,
      baseUrl: originalEndpoint
    })

    const TargetOctokit = new MyOctokit({
      auth: targetToken,
      baseUrl: targetEndpoint
    })

    let matches: Matches[] = []

    // Fetch and sync alerts
    if (alertTypes.includes('all') || alertTypes.includes('secret-scanning')) {
      core.info('Processing Secret Scanning Alerts...')
      const originalAlerts = await fetchSecretScanningAlerts(
        OriginalOctokit,
        originalOwner,
        originalRepo
      )
      core.debug(
        `Fetched ${originalAlerts.length} alerts from the original repository`
      )
      const targetAlerts = await fetchSecretScanningAlerts(
        TargetOctokit,
        targetOwner,
        targetRepo
      )
      core.debug(
        `Fetched ${targetAlerts.length} alerts from the target repository`
      )

      matches = mapSecretScanningAlerts(originalAlerts, targetAlerts)

      core.debug(`Found ${matches.length} matches`)

      await updateSecretScanningAlerts(
        matches,
        TargetOctokit,
        targetOwner,
        targetRepo,
        dryRun
      )
    }

    // TODO: Handle other alert types...

    // Save report
    const reportPath = './reports/ghas-alert-mapping-report.md'
    const reportContent = generateReport(matches)
    saveReport(reportPath, reportContent)

    // Outputs
    core.setOutput('report-file', reportPath)
    core.info(`Action completed. Report file: ${reportPath}`)
  } catch (error) {
    core.setFailed(`Action failed with error: ${String(error)}`)
  }
}

run().catch(error => {
  core.setFailed(`Unhandled error: ${String(error)}`)
})
