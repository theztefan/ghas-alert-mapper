import * as core from '@actions/core'

export class ErrorTracker {
  private errors: string[] = []

  addError(error: string): void {
    this.errors.push(error)
    core.error(error)
  }

  hasErrors(): boolean {
    return this.errors.length > 0
  }

  getErrors(): string[] {
    return [...this.errors]
  }

  getErrorCount(): number {
    return this.errors.length
  }

  getErrorMessages(): string {
    return this.errors.join(', ')
  }

  setOutputs(): void {
    core.setOutput('has_errors', this.hasErrors().toString())
    core.setOutput('error_messages', this.getErrorMessages())
    core.setOutput('error_count', this.getErrorCount().toString())
  }
}
