import * as core from '@actions/core'
import { MyOctokit } from './MyOctokit'
import {
  fetchSecretScanningAlerts,
  mapSecretScanningAlerts,
  updateSecretScanningAlerts
} from './SecretScanning.js'
import { generateReport, saveReport } from './Report'
import { Matches } from './types/common/main.d'
import { ErrorTracker } from './ErrorTracker'

export async function run(): Promise<void> {
  const errorTracker = new ErrorTracker()

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
      core.getInput('target_endpoint') || 'https://api.github.com'
    const targetToken = core.getInput('target_token', { required: true })
    const dryRun = core.getBooleanInput('dry_run', { required: true })
    const alertTypesInput = core.getInput('alert_types') || 'all'
    const matchingLevel = core.getInput('matching-level') || 'exact'

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
        originalRepo,
        errorTracker
      )
      core.debug(
        `Fetched ${originalAlerts.length} alerts from the original repository`
      )
      const targetAlerts = await fetchSecretScanningAlerts(
        TargetOctokit,
        targetOwner,
        targetRepo,
        errorTracker
      )
      core.debug(
        `Fetched ${targetAlerts.length} alerts from the target repository`
      )

      matches = mapSecretScanningAlerts(
        originalAlerts,
        targetAlerts,
        matchingLevel
      )

      core.debug(`Found ${matches.length} matches`)

      await updateSecretScanningAlerts(
        matches,
        TargetOctokit,
        targetOwner,
        targetRepo,
        dryRun,
        errorTracker
      )
    }

    // TODO: Handle other alert types...

    // Save report
    const reportPath = './reports/ghas-alert-mapping-report.md'
    const timestamp = new Date().toISOString()
    const reportContent = generateReport(
      matches,
      originalRepository,
      targetRepository,
      originalEndpoint,
      targetEndpoint,
      dryRun,
      alertTypes,
      matchingLevel,
      timestamp
    )
    saveReport(reportPath, reportContent)

    // Set error outputs
    errorTracker.setOutputs()

    // Outputs
    core.setOutput('report_file', reportPath)

    if (errorTracker.hasErrors()) {
      core.warning(
        `Action completed with ${errorTracker.getErrorCount()} error(s). Check error_messages output for details.`
      )
    } else {
      core.info('Action completed successfully without errors.')
    }

    core.info(`Action completed. Report file: ${reportPath}`)
  } catch (error) {
    errorTracker.addError(`Critical error: ${String(error)}`)
    errorTracker.setOutputs()
    core.setFailed(`Action failed with error: ${String(error)}`)
  }
}
