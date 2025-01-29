import { MyOctokit } from '../../src/MyOctokit.ts'

describe('MyOctokit', () => {
  it('should create instance with default options', () => {
    const octokit = new MyOctokit()
    expect(octokit).toBeInstanceOf(MyOctokit)
    expect(octokit.request.endpoint.DEFAULTS.baseUrl).toBe(
      'https://api.github.com'
    )
  })

  it('should create instance with custom options', () => {
    const options = {
      auth: 'test-token',
      baseUrl: 'https://api.custom.com'
    }
    const octokit = new MyOctokit(options)
    expect(octokit.request.endpoint.DEFAULTS.baseUrl).toBe(options.baseUrl)
  })
})
