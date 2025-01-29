import { Octokit } from '@octokit/core'
import { paginateRest } from '@octokit/plugin-paginate-rest'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'
import { throttling } from '@octokit/plugin-throttling'

// Create Octokit constructor with plugins
const MyOctokitWithPlugins = Octokit.plugin(paginateRest)
  .plugin(restEndpointMethods)
  .plugin(throttling)

export interface MyOctokitOptions {
  auth?: string
  baseUrl?: string
}

export class MyOctokit extends MyOctokitWithPlugins {
  constructor(options: MyOctokitOptions = {}) {
    super({
      ...options,
      throttle: {
        onRateLimit: (retryAfter, opts, octokit) => {
          octokit.log.warn(
            `Request quota exhausted for request ${opts.method} ${opts.url}`
          )
          if (opts.request.retryCount <= 2) {
            console.log(`Retrying after ${retryAfter} seconds!`)
            return true
          }
        },
        onSecondaryRateLimit: (retryAfter, opts, octokit) => {
          octokit.log.warn(
            `Secondary rate limit for request ${opts.method} ${opts.url}`
          )
          if (opts.request.retryCount <= 2) {
            console.log(
              `Secondary Limit - Retrying after ${retryAfter} seconds!`
            )
            return true
          }
        }
      }
    })
  }
}
