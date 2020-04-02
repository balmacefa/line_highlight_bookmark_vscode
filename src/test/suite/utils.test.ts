import * as assert from 'assert'
import { getNextLine } from '../../utils'

suite('utils', () => {
  test('getNextLine', () => {
    const ar = [0, 1, 3, 5, 6, 7, 9, 10]
    const check = (val: number, okResult: number) => {
      const res = getNextLine(ar, val)

      assert.equal(res, okResult)
    }

    check(0, 1)
    check(1, 3)
    check(2, 3)
    check(3, 5)
    check(4, 5)
    check(5, 6)
    check(6, 7)
    check(7, 9)
    check(8, 9)
    check(9, 10)
    check(10, 0)
  })
})
