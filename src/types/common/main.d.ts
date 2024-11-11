export interface SecretScanningAlert {
  number: number
  state: 'open' | 'resolved'
  secret_type: string
  secret: string
  resolution?:
    | 'false_positive'
    | 'wont_fix'
    | 'revoked'
    | 'used_in_tests'
    | null
  resolution_comment?: string
  resolved_by?: {
    login: string
  }
  resolved_at?: string
  locations?: SecretScanningLocation[]
  totalLocations?: number
  html_url: string
}

export interface SecretScanningLocation {
  type:
    | 'commit'
    | 'wiki_commit'
    | 'issue_title'
    | 'issue_body'
    | 'issue_comment'
    | 'discussion_title'
    | 'discussion_body'
    | 'discussion_comment'
    | 'pull_request_title'
    | 'pull_request_body'
    | 'pull_request_comment'
    | 'pull_request_review'
    | 'pull_request_review_comment'
  details: {
    commit_sha?: string
    path?: string
    start_line?: number
    end_line?: number
    start_column?: number
    end_column?: number
    blob_sha?: string
    blob_url?: string
    commit_url?: string
    page_url?: string
    issue_title_url?: string
    issue_body_url?: string
    issue_comment_url?: string
    discussion_title_url?: string
    discussion_body_url?: string
    discussion_comment_url?: string
    pull_request_title_url?: string
    pull_request_body_url?: string
    pull_request_comment_url?: string
    pull_request_review_url?: string
    pull_request_review_comment_url?: string
  }
}

export interface Matches {
  originalAlert: SecretScanningAlert
  targetAlert: SecretScanningAlert
  updatedAlert: SecretScanningAlert
  isSecretTypeMatch: boolean
  isSecretMatch: boolean
  isLocationCountMatch: boolean
  isStateMatch: boolean
}
