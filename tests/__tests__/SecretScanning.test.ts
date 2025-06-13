import { MyOctokit } from '../../src/MyOctokit'
import {
  fetchSecretScanningAlerts,
  mapSecretScanningAlerts,
  updateSecretScanningAlerts
} from '../../src/SecretScanning'
import { ErrorTracker } from '../../src/ErrorTracker'
import { SecretScanningAlert, Matches } from '../../src/types/common/main.d'

// Mock the @actions/core module
jest.mock('@actions/core', () => ({
  error: jest.fn(),
  info: jest.fn(),
  setOutput: jest.fn()
}))

describe('SecretScanning', () => {
  let mockOctokit: jest.Mocked<MyOctokit>
  let errorTracker: ErrorTracker

  beforeEach(() => {
    mockOctokit = {
      paginate: jest.fn(),
      rest: {
        secretScanning: {
          listAlertsForRepo: jest.fn(),
          listLocationsForAlert: jest.fn(),
          updateAlert: jest.fn()
        }
      }
    } as any
    errorTracker = new ErrorTracker()
  })

  describe('fetchSecretScanningAlerts', () => {
    it('should fetch secret scanning alerts successfully', async () => {
      const mockAlerts = [
        {
          number: 1,
          secret_type: 'github_token',
          secret: 'ghp_test123',
          state: 'open'
        }
      ]
      const mockLocations = [
        {
          path: 'test.js',
          start_line: 1,
          end_line: 1
        }
      ]

      mockOctokit.paginate
        .mockResolvedValueOnce(mockAlerts)
        .mockResolvedValueOnce(mockLocations)

      const result = await fetchSecretScanningAlerts(
        mockOctokit,
        'owner',
        'repo',
        errorTracker
      )

      expect(result).toHaveLength(1)
      expect(result[0].locations).toEqual(mockLocations)
      expect(result[0].totalLocations).toBe(1)
      expect(errorTracker.hasErrors()).toBe(false)
    })

    it('should handle errors when fetching alerts fails', async () => {
      const error = new Error('Secret scanning is disabled on this repository')
      mockOctokit.paginate.mockRejectedValueOnce(error)

      const result = await fetchSecretScanningAlerts(
        mockOctokit,
        'owner',
        'repo',
        errorTracker
      )

      expect(result).toEqual([])
      expect(errorTracker.hasErrors()).toBe(true)
      expect(errorTracker.getErrorCount()).toBe(1)
      expect(errorTracker.getErrorMessages()).toContain(
        'Error fetching secret scanning alerts for owner/repo'
      )
    })
  })

  describe('mapSecretScanningAlerts', () => {
    it('should map alerts with exact matching', () => {
      const originalAlerts: SecretScanningAlert[] = [
        {
          number: 1,
          secret_type: 'github_token',
          secret: 'ghp_test123',
          state: 'resolved',
          resolution: 'false_positive',
          resolution_comment: 'Not a real token',
          totalLocations: 1
        }
      ]

      const targetAlerts: SecretScanningAlert[] = [
        {
          number: 2,
          secret_type: 'github_token',
          secret: 'ghp_test123',
          state: 'open',
          totalLocations: 1
        }
      ]

      const matches = mapSecretScanningAlerts(
        originalAlerts,
        targetAlerts,
        'exact'
      )

      expect(matches).toHaveLength(1)
      expect(matches[0].isSecretTypeMatch).toBe(true)
      expect(matches[0].isSecretMatch).toBe(true)
      expect(matches[0].isLocationCountMatch).toBe(true)
      expect(matches[0].isStateMatch).toBe(false)
    })

    it('should return empty array when no matches found', () => {
      const originalAlerts: SecretScanningAlert[] = [
        {
          number: 1,
          secret_type: 'github_token',
          secret: 'ghp_test123',
          state: 'resolved',
          totalLocations: 1
        }
      ]

      const targetAlerts: SecretScanningAlert[] = [
        {
          number: 2,
          secret_type: 'aws_secret',
          secret: 'aws_secret456',
          state: 'open',
          totalLocations: 1
        }
      ]

      const matches = mapSecretScanningAlerts(
        originalAlerts,
        targetAlerts,
        'exact'
      )

      expect(matches).toHaveLength(0)
    })
  })

  describe('updateSecretScanningAlerts', () => {
    it('should update alerts when not in dry run mode', async () => {
      const matches: Matches[] = [
        {
          originalAlert: {
            number: 1,
            secret_type: 'github_token',
            secret: 'ghp_test123',
            state: 'resolved',
            resolution: 'false_positive',
            resolution_comment: 'Not a real token',
            resolved_by: {
              login: 'testuser'
            }
          },
          targetAlert: {
            number: 2,
            secret_type: 'github_token',
            secret: 'ghp_test123',
            state: 'open'
          },
          updatedAlert: {
            number: 2,
            secret_type: 'github_token',
            secret: 'ghp_test123',
            state: 'resolved',
            resolution: 'false_positive',
            resolution_comment: '[@testuser] Not a real token'
          },
          isSecretTypeMatch: true,
          isSecretMatch: true,
          isLocationCountMatch: true,
          isStateMatch: false
        }
      ]

      await updateSecretScanningAlerts(
        matches,
        mockOctokit,
        'owner',
        'repo',
        false,
        errorTracker
      )

      expect(mockOctokit.rest.secretScanning.updateAlert).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        alert_number: 2,
        state: 'resolved',
        resolution: 'false_positive',
        resolution_comment: '[@testuser] Not a real token'
      })
      expect(errorTracker.hasErrors()).toBe(false)
    })

    it('should handle errors when updating alerts fails', async () => {
      const matches: Matches[] = [
        {
          originalAlert: {
            number: 1,
            secret_type: 'github_token',
            secret: 'ghp_test123',
            state: 'resolved'
          },
          targetAlert: {
            number: 2,
            secret_type: 'github_token',
            secret: 'ghp_test123',
            state: 'open'
          },
          updatedAlert: {
            number: 2,
            secret_type: 'github_token',
            secret: 'ghp_test123',
            state: 'resolved'
          },
          isSecretTypeMatch: true,
          isSecretMatch: true,
          isLocationCountMatch: true,
          isStateMatch: false
        }
      ]

      const error = new Error('API rate limit exceeded')
      mockOctokit.rest.secretScanning.updateAlert.mockRejectedValueOnce(error)

      await updateSecretScanningAlerts(
        matches,
        mockOctokit,
        'owner',
        'repo',
        false,
        errorTracker
      )

      expect(errorTracker.hasErrors()).toBe(true)
      expect(errorTracker.getErrorCount()).toBe(1)
      expect(errorTracker.getErrorMessages()).toContain(
        'Error updating alert #2 in owner/repo'
      )
    })

    it('should not update alerts in dry run mode', async () => {
      const matches: Matches[] = [
        {
          originalAlert: {
            number: 1,
            secret_type: 'github_token',
            secret: 'ghp_test123',
            state: 'resolved'
          },
          targetAlert: {
            number: 2,
            secret_type: 'github_token',
            secret: 'ghp_test123',
            state: 'open'
          },
          updatedAlert: {
            number: 2,
            secret_type: 'github_token',
            secret: 'ghp_test123',
            state: 'resolved'
          },
          isSecretTypeMatch: true,
          isSecretMatch: true,
          isLocationCountMatch: true,
          isStateMatch: false
        }
      ]

      await updateSecretScanningAlerts(
        matches,
        mockOctokit,
        'owner',
        'repo',
        true,
        errorTracker
      )

      expect(mockOctokit.rest.secretScanning.updateAlert).not.toHaveBeenCalled()
      expect(errorTracker.hasErrors()).toBe(false)
    })
  })
})
