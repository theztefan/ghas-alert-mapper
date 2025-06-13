import { describe, expect, jest, it } from '@jest/globals'
import { generateReport, saveReport } from '../../src/Report.ts'
import * as fs from 'fs'
import * as core from '@actions/core'
import { Matches, SecretScanningAlert } from '../../src/types/common/main'

// Mock dependencies
jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn()
}))

jest.mock('@actions/core', () => ({
  info: jest.fn(),
  setFailed: jest.fn()
}))

// Test data
const mockSecretAlert: SecretScanningAlert = {
  number: 1,
  html_url: 'https://github.com/test/repo/alert/1',
  secret_type: 'test_secret',
  secret: 'secret123',
  state: 'open',
  resolution: null,
  resolved_by: { login: 'actor' },
  resolved_at: 'date',
  locations: [],
  totalLocations: 0
}

const mockMatches: Matches = {
  originalAlert: { ...mockSecretAlert, number: 1 },
  targetAlert: { ...mockSecretAlert, number: 2 },
  updatedAlert: { ...mockSecretAlert, number: 2 },
  isSecretTypeMatch: true,
  isSecretMatch: true,
  isLocationCountMatch: true,
  isStateMatch: true
}

describe('Report', () => {
  describe('generateReport', () => {
    it('should generate empty report when no matches', () => {
      const report = generateReport(
        [],
        'owner/original-repo',
        'owner/target-repo',
        'https://api.github.com',
        'https://api.github.com',
        true,
        ['secret-scanning'],
        'exact',
        '2025-06-13T00:00:00.000Z'
      )
      expect(report).toContain('# GHAS Alert Mapping Report')
      expect(report).toContain('| Original Alert | Target Alert |')
      expect(report).not.toContain('|#')
    })

    it('should generate report with single match', () => {
      const report = generateReport(
        [mockMatches],
        'owner/original-repo',
        'owner/target-repo',
        'https://api.github.com',
        'https://api.github.com',
        true,
        ['secret-scanning'],
        'exact',
        '2025-06-13T00:00:00.000Z'
      )
      expect(report).toContain(`[#1](${mockMatches.originalAlert.html_url})`)
      expect(report).toContain(`[#2](${mockMatches.targetAlert.html_url})`)
      expect(report).toContain('✅')
    })

    it('should generate report with failed matches', () => {
      const failedMatches: Matches = {
        ...mockMatches,
        isSecretTypeMatch: false,
        isSecretMatch: false,
        isLocationCountMatch: false,
        isStateMatch: false
      }

      const report = generateReport(
        [failedMatches],
        'owner/original-repo',
        'owner/target-repo',
        'https://api.github.com',
        'https://api.github.com',
        true,
        ['secret-scanning'],
        'exact',
        '2025-06-13T00:00:00.000Z'
      )
      expect(report).toContain('❌')
    })
  })

  describe('saveReport', () => {
    it('should create directory and save report successfully', () => {
      const testPath = 'test/report.md'
      const content = '# Test Report'

      saveReport(testPath, content)

      expect(fs.mkdirSync).toHaveBeenCalledWith('./reports', {
        recursive: true
      })
      expect(fs.writeFileSync).toHaveBeenCalledWith(testPath, content)
      expect(core.info).toHaveBeenCalledWith(`Report saved to ${testPath}`)
    })

    it('should handle errors when saving fails', () => {
      const error = new Error('Write failed')
      ;(fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw error
      })

      saveReport('test.md', 'content')

      expect(core.setFailed).toHaveBeenCalledWith(
        'Failed to save report: Error: Write failed'
      )
    })
  })
})
