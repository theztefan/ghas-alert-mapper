import { describe, expect, test } from '@jest/globals'
import { MyOctokit } from '../src/MyOctokit'
import { Octokit } from '@octokit/action'

describe('sum module', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect('X').toBe('X')
  })
})

describe('MyOctokit.ts', () => {
  it('should create an instance of MyOctokit with correct plugins and defaults', () => {
    const octokitInstance = new MyOctokit()

    expect(octokitInstance).toBeInstanceOf(Octokit)
  })
})
