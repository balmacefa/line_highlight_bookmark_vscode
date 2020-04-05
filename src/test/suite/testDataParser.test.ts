import * as assert from 'assert'
import * as fixtures from './fixtures'
import { parseTestData } from './testDataParser'

test('testDataParser', () => {
  const testCases = parseTestData('./test-data.txt')
  const COUNT = 14

  if (testCases.length > COUNT) {
    console.warn(
      'ONLY %s tests are checked now for parsing (got %s)',
      COUNT,
      testCases.length
    )
  }

  assert.deepEqual(testCases[0], fixtures.testCase1)
  assert.deepEqual(testCases[1], fixtures.testCase2)
  assert.deepEqual(testCases[2], fixtures.testCase3)
  assert.deepEqual(testCases[3], fixtures.testCase4)
  assert.deepEqual(testCases[4], fixtures.testCase5)
  assert.deepEqual(testCases[5], fixtures.testCase6)
  assert.deepEqual(testCases[6], fixtures.testCase7)
  assert.deepEqual(testCases[7], fixtures.testCase8)
  assert.deepEqual(testCases[8], fixtures.testCase9)
  assert.deepEqual(testCases[9], fixtures.testCase10)
  assert.deepEqual(testCases[10], fixtures.testCase11)
  assert.deepEqual(testCases[11], fixtures.testCase12)
  assert.deepEqual(testCases[12], fixtures.testCase13)
  assert.deepEqual(testCases[13], fixtures.testCase14)
})
