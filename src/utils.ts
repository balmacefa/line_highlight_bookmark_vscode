import * as fs from 'fs'
import * as vscode from 'vscode'
import { logger } from './logger'

const LINE_END = 999

export const isDebug = () => false

export const fileExists = (path: string) => fs.existsSync(path)

export const moveCursorToLine = (line: number, column: number = LINE_END) => {
  if (!vscode.window.activeTextEditor) {
    return
  }

  let reviewType: vscode.TextEditorRevealType =
    vscode.TextEditorRevealType.InCenter

  if (line === vscode.window.activeTextEditor.selection.active.line) {
    reviewType = vscode.TextEditorRevealType.InCenterIfOutsideViewport
  }

  const newSelection = new vscode.Selection(line, column, line, column)
  vscode.window.activeTextEditor.selection = newSelection
  vscode.window.activeTextEditor.revealRange(newSelection, reviewType)
}

export const line2range = (line: number) => {
  const start = new vscode.Position(line, 0)
  const end = new vscode.Position(line, LINE_END)
  return new vscode.Range(start, end)
}

export const range2line = (range: vscode.Range): number => range.start.line

export const getNextLine = (lines: number[], currentLine: number): number => {
  if (!lines.length) {
    return currentLine
  }

  logger.info(`getNextLine: ${JSON.stringify(lines)} ${currentLine}`)

  if (currentLine < lines[0]) {
    return lines[0]
  } else if (currentLine >= lines[lines.length - 1]) {
    return lines[0]
  }

  let index = 1
  while (currentLine >= lines[index++]) {}

  return lines[index - 1]
}

export const getPrevLine = (lines: number[], currentLine: number): number => {
  if (!lines.length) {
    return currentLine
  }

  logger.info(`getPrevLine: ${JSON.stringify(lines)} ${currentLine}`)

  if (currentLine > lines[lines.length - 1]) {
    return lines[lines.length - 1]
  } else if (currentLine <= lines[0]) {
    return lines[lines.length - 1]
  }

  let index = lines.length - 2
  while (currentLine <= lines[index--]) {}

  return lines[index + 1]
}

export const createDecoration = (
  context: vscode.ExtensionContext
): vscode.TextEditorDecorationType => {
  const decorationOptions: vscode.DecorationRenderOptions = {
    gutterIconPath: context.asAbsolutePath('images/icon.svg'),
    dark: {
      gutterIconPath: context.asAbsolutePath('images/icond.svg'),
    },
  }
  return vscode.window.createTextEditorDecorationType(decorationOptions)
}

export const createLinesRange = (start: number, endInclusive: number) => {
  const range = []
  for (let i = start; i <= endInclusive; i++) {
    range.push(i)
  }
  return range
}
