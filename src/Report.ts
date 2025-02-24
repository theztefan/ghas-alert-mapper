import * as fs from 'fs'
import * as core from '@actions/core'
import { Matches } from './types/common/main.d'

export const saveReport = (reportPath: string, content: string): void => {
  try {
    fs.mkdirSync('./reports', { recursive: true })
    fs.writeFileSync(reportPath, content)
    core.info(`Report saved to ${reportPath}`)
  } catch (error) {
    core.setFailed(`Failed to save report: ${String(error)}`)
  }
}

export const generateReport = (
  matches: Matches[],
  originalRepository: string,
  targetRepository: string,
  originalEndpoint: string,
  targetEndpoint: string,
  dryRun: boolean,
  alertTypes: string[],
  matchingLevel: string,
  timestamp: string
): string => {
  let reportContent = `# GHAS Alert Mapping Report\n\n**Timestamp:** ${timestamp}\n\n`
  reportContent += `**Original Repo:** ${originalRepository}\n`
  reportContent += `**Target Repo:** ${targetRepository}\n`
  reportContent += `**Original Endpoint:** ${originalEndpoint}\n`
  reportContent += `**Target Endpoint:** ${targetEndpoint}\n`
  reportContent += `**Dry Run:** ${dryRun}\n`
  reportContent += `**Alert Types:** ${alertTypes.join(', ')}\n`
  reportContent += `**Matching Level:** ${matchingLevel}\n\n`

  // Table header
  reportContent +=
    '| Original Alert | Target Alert | Secret Type Match | Secret Match | Location Count Match | State Match |\n'
  reportContent +=
    '|---------------|--------------|-------------------|--------------|-----------------------|-------------|\n'

  // Generate table rows
  for (const match of matches) {
    const secretTypeMatch = match.isSecretTypeMatch ? '✅' : '❌'
    const secretMatch = match.isSecretMatch ? '✅' : '❌'
    const locationCountMatch = match.isLocationCountMatch ? '✅' : '❌'
    const stateMatch = match.isStateMatch ? '✅' : '❌'

    reportContent += `| [#${match.originalAlert.number}](${match.originalAlert.html_url}) `
    reportContent += `| [#${match.targetAlert.number}](${match.targetAlert.html_url}) `
    reportContent += `| ${secretTypeMatch} `
    reportContent += `| ${secretMatch} `
    reportContent += `| ${locationCountMatch} `
    reportContent += `| ${stateMatch} |\n`
  }

  return reportContent
}
