import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

type ContentChange =
  | vscode.TextDocumentContentChangeEvent
  | {
      range: {
        start?: Partial<vscode.Position>
        end?: Partial<vscode.Position>
      }
    }

export type TestCase = {
  debug?: any
  before: {
    lines: string[]
    markers: number[]
  }
  after: {
    lines: string[]
    markers: number[]
  }
  textChange: vscode.TextDocumentContentChangeEvent
}

const getFilePath = (file: string) => path.join('./src/test/suite', file)

const re = {
  marker: / \*$/,
  replacement: /===\[((?:.|\n)*)\]===/,
  selection: /\[((?:.|\n)*)\]/m,
}

const parseTestCase = (testCase: string): TestCase => {
  // Extract replacement part
  // Split case into before and after
  const replacement = testCase.match(re.replacement)?.[1]
  const parts = testCase
    .replace(re.replacement, '###')
    .split('###')
    .map((p) => p.replace(/^\s*/, '').replace(/\s*$/, ''))

  let beforePart = parts[0]
  const range: ContentChange['range'] = {}
  beforePart.split('\n').forEach((line, index) => {
    const openIndex = line.indexOf('[')
    if (openIndex >= 0) {
      range.start = { line: index, character: openIndex }
      line = line.replace('[', '')
    }

    const closeIndex = line.indexOf(']')
    if (closeIndex >= 0) {
      range.end = { line: index, character: closeIndex }
      line = line.replace(']', '')
    }
  })

  // const selection = beforePart.match(re.selection)?.[1]
  beforePart = beforePart.replace('[', '').replace(']', '')

  const afterPart = parts[1]

  const splitPartIntoLines = (part: string) => ({
    lines: part.split('\n').map((l) => l.replace(re.marker, '')),
    markers: part
      .split('\n')
      .map((l, i) => [re.marker.test(l), i])
      .filter(([flag]) => flag)
      .map(([_, i]) => i),
  })

  const result = {
    // debug: {
    //   lines: testCase.split('\n'),
    //   selection,
    //   replacement,
    // },
    before: splitPartIntoLines(beforePart),
    after: splitPartIntoLines(afterPart),
    textChange: {
      range,
      text: replacement,
    },
  }

  return result as TestCase
}

export const parseTestData = (file: string) => {
  const data = fs.readFileSync(getFilePath(file), 'utf8')
  return data
    .split('\n\n\n')
    .map((testCase: string) => testCase.replace(/^\s*/, '').replace(/\s*$/, ''))
    .map(parseTestCase)
}
