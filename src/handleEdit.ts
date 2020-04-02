import * as vscode from 'vscode'

export const handleEdit = (
  markedLines: number[] = [],
  { range, text }: vscode.TextDocumentContentChangeEvent
) => {
  if (!markedLines.length) {
    return markedLines
  }

  const selectionLinesCount = range.end.line - range.start.line
  const substitutionLinesCount = text.split('\n').length

  const isSameLineRange = selectionLinesCount === 0
  const isSubstitutionOnSameLine = substitutionLinesCount === 1

  if (isSameLineRange) {
    if (isSubstitutionOnSameLine) {
      return markedLines
    }

    return markedLines.map((line) => {
      return line <= range.start.line ? line : line + substitutionLinesCount - 1
    })
  }

  const result: any = {}
  markedLines.forEach((line) => {
    if (line < range.start.line) {
      result[line] = true
    } else if (line === range.start.line) {
      if (range.start.character > 0) {
        result[line] = true
      }
    } else if (line >= range.end.line) {
      result[line - selectionLinesCount - 1 + substitutionLinesCount] = true
    }
  })

  return Object.keys(result).map((l) => +l)
}
