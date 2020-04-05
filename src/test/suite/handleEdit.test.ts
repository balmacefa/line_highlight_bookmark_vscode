const forEach = require('mocha-each')
import * as assert from 'assert'
import { parseTestData } from './testDataParser'
import { handleEdit } from '../../handleEdit'

suite('handleEdit', () => {
  parseTestData('./test-data.txt').forEach((testCase: any, index: number) => {
    test(`test case ${index}`, () => {
      assert.deepEqual(
        handleEdit(testCase.before.markers, testCase.textChange),
        testCase.after.markers
      )
    })
  })
})
