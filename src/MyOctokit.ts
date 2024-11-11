import { Octokit } from '@octokit/action'
import { throttling } from '@octokit/plugin-throttling'

export const MyOctokit = Octokit.plugin(throttling).defaults({
  throttle: {
    onRateLimit: (retryAfter: any, options: any, octokit: any) => {
      octokit.log.warn(
        `Request quota exhausted for ${options.method} ${options.url}`
      )
      if (options.request.retryCount <= 2) {
        console.log(`Retrying after ${retryAfter} seconds!`)
        return true
      }
      return false
    },
    onSecondaryRateLimit: (retryAfter: any, options: any, octokit: any) => {
      octokit.log.warn(
        `Secondary rate limit hit for ${options.method} ${options.url}`
      )
      if (options.request.retryCount <= 2) {
        console.log(`Retrying after ${retryAfter} seconds!`)
        return true
      }
      return false
    }
  }
})
