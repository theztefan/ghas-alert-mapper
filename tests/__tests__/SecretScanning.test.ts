import { describe, expect, jest, it, afterEach } from '@jest/globals'
jest.mock('@actions/core')

import {
  fetchSecretScanningAlerts,
  mapSecretScanningAlerts,
  updateSecretScanningAlerts
} from '../../src/SecretScanning.ts'
import { MyOctokit } from '../../src/MyOctokit.ts'
import * as core from '@actions/core'
import {
  Matches,
  SecretScanningAlert,
  SecretScanningLocation
} from '../../src/types/common/main'
import { OctokitResponse } from '@octokit/types'

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

const mockSecretLocation: SecretScanningLocation = {
  type: 'commit',
  details: {
    path: 'path/to/secret',
    start_line: 1,
    end_line: 1,
    start_column: 1,
    end_column: 1
  }
}

const mockMatches: Matches = {
  originalAlert: {
    ...mockSecretAlert,
    number: 1,
    locations: [mockSecretLocation],
    totalLocations: 1
  },
  targetAlert: {
    ...mockSecretAlert,
    number: 1,
    locations: [mockSecretLocation],
    totalLocations: 1
  },
  updatedAlert: {
    ...mockSecretAlert,
    number: 1,
    locations: [mockSecretLocation],
    totalLocations: 1,
    resolution_comment: '[sync]  # closed by: actor'
  },
  isSecretTypeMatch: true,
  isSecretMatch: true,
  isLocationCountMatch: true,
  isStateMatch: true
}

const mockNonMatches: Matches = {
  originalAlert: {
    ...mockSecretAlert,
    number: 1,
    locations: [mockSecretLocation],
    totalLocations: 1
  },
  targetAlert: {
    ...mockSecretAlert,
    number: 1,
    locations: [mockSecretLocation],
    totalLocations: 1
  },
  updatedAlert: {
    ...mockSecretAlert,
    number: 1,
    locations: [mockSecretLocation],
    totalLocations: 1,
    resolution_comment: '[sync]  # closed by: actor'
  },
  isSecretTypeMatch: true,
  isSecretMatch: true,
  isLocationCountMatch: true,
  isStateMatch: false
}

describe('SecretScanning', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchSecretScanningAlerts', () => {
    it('should fetch secret scanning alerts successfully', async () => {
      const octokit = new MyOctokit()
      jest.spyOn(octokit, 'paginate').mockResolvedValueOnce([mockSecretAlert])
      jest
        .spyOn(octokit, 'paginate')
        .mockResolvedValueOnce([mockSecretLocation])

      const alerts = await fetchSecretScanningAlerts(octokit, 'owner', 'repo')
      expect(alerts).toEqual([
        {
          ...mockSecretAlert,
          locations: [mockSecretLocation],
          totalLocations: 1
        }
      ])
    })

    it('should handle errors when fetching alerts fails', async () => {
      const octokit = new MyOctokit()
      jest
        .spyOn(octokit, 'paginate')
        .mockRejectedValue(new Error('Fetch failed'))

      const alerts = await fetchSecretScanningAlerts(octokit, 'owner', 'repo')
      expect(alerts).toEqual([])
      expect(core.setFailed).toHaveBeenCalledWith(
        'Error fetching secret scanning alerts: Error: Fetch failed'
      )
    })
  })

  describe('mapSecretScanningAlerts', () => {
    it('should return empty matches when no alerts', () => {
      const matches = mapSecretScanningAlerts([], [])
      expect(matches).toEqual([])
    })

    it('should map matching alerts', () => {
      const matches = mapSecretScanningAlerts(
        [mockSecretAlert],
        [mockSecretAlert]
      )
      expect(matches).toEqual([mockMatches])
    })

    it('should not map non-matching alerts', () => {
      const nonMatchingAlert = {
        ...mockSecretAlert,
        secret: 'different_secret'
      }
      const matches = mapSecretScanningAlerts(
        [mockSecretAlert],
        [nonMatchingAlert]
      )
      expect(matches).toEqual([])
    })
  })

  describe('updateSecretScanningAlerts', () => {
    it('should update alerts successfully', async () => {
      const octokit = new MyOctokit()
      const mockResponse: OctokitResponse<any, 200> = {
        headers: {},
        status: 200,
        url: '',
        data: {},
        retryCount: 0
      }
      jest
        .spyOn(octokit.rest.secretScanning, 'updateAlert')
        .mockResolvedValue(mockResponse)

      await updateSecretScanningAlerts(
        [mockNonMatches],
        octokit,
        'owner',
        'repo',
        false
      )
      expect(octokit.rest.secretScanning.updateAlert).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        alert_number: 1,
        state: 'open',
        resolution: null,
        resolution_comment: '[sync]  # closed by: actor'
      })
    })

    it('should handle dry run', async () => {
      const octokit = new MyOctokit()
      const mockResponse: OctokitResponse<any, 200> = {
        headers: {},
        status: 200,
        url: '',
        data: {},
        retryCount: 0
      }
      jest
        .spyOn(octokit.rest.secretScanning, 'updateAlert')
        .mockResolvedValue(mockResponse)

      await updateSecretScanningAlerts(
        [mockNonMatches],
        octokit,
        'owner',
        'repo',
        true
      )
      expect(octokit.rest.secretScanning.updateAlert).not.toHaveBeenCalled()
      expect(core.info).toHaveBeenCalled()
    })
  })
})
