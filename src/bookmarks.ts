import * as vscode from 'vscode'
import { logger } from './logger'
import {
  isDebug,
  fileExists,
  getNextLine,
  moveCursorToLine,
  line2range,
  createDecoration,
  createLinesRange,
} from './utils'
import { handleEdit } from './handleEdit'

const storeKey = 'bookmarksNG'

type Bookmarks = {
  [bookmarkKey: string]: {
    line: number
    decoration: vscode.TextEditorDecorationType
  }
}

type BookmarksStateDump = {
  [filePath: string]: number[]
}

function getKey(line: number) {
  return `b${line}`
}

export const bookmarksManager = {
  bookmarks: {} as Bookmarks,
  filePath: '' as string | undefined,

  _getLines() {
    return Object.values(this.bookmarks)
      .map(({ line }) => line)
      .sort((a, b) => a - b)
  },

  _clearBookmarks() {
    Object.values(this.bookmarks).forEach(({ decoration }) =>
      decoration.dispose()
    )
    this.bookmarks = {}
  },

  _clearBookmarksAtLines(lines: number[]) {
    let someCleared = false

    lines
      .map((l) => getKey(l))
      .forEach((key) => {
        const bookmark = this.bookmarks[key]
        if (bookmark) {
          bookmark.decoration.dispose()
          delete this.bookmarks[key]
          someCleared = true
        }
      })

    return someCleared
  },

  _getStoredData(context: vscode.ExtensionContext): BookmarksStateDump {
    try {
      const data: BookmarksStateDump = JSON.parse(
        context.workspaceState.get(storeKey, '{}')
      )
      return data
    } catch (ex) {
      logger.error(`_getStoredData ${ex.message}`)
      return {}
    }
  },

  _saveToState(context: vscode.ExtensionContext) {
    if (!this.filePath) {
      return
    }

    const data = {
      ...this._getStoredData(context),
      [this.filePath]: this._getLines(),
    }
    const saveData: BookmarksStateDump = {}

    Object.keys(data).forEach((filePath) => {
      const lines = data[filePath]
      if (lines.length && fileExists(filePath)) {
        saveData[filePath] = lines
      }
    })

    logger.info(`will save ${JSON.stringify(saveData)}`)

    context.workspaceState.update(storeKey, JSON.stringify(saveData))
  },

  _loadFromState(context: vscode.ExtensionContext) {
    const data = this._getStoredData(context)
    if (this.filePath) {
      this._setBookmarkLines(context, data[this.filePath])
    }
  },

  _setBookmarkLines(context: vscode.ExtensionContext, lines?: number[]) {
    this._clearBookmarks()

    if (!this.filePath || !lines?.length) {
      return
    }

    logger.info(`will load bookmarks for lines ${lines}`)

    lines.forEach((line) => this._bookmarkLine(line, context))
  },

  _bookmarkLine(line: number, context: vscode.ExtensionContext) {
    const key = getKey(line)
    const decoration =
      this.bookmarks[key]?.decoration || createDecoration(context)

    const range = line2range(line)
    vscode.window.activeTextEditor?.setDecorations(decoration, [range])
    this.bookmarks[key] = { decoration, line }
  },

  loadForFile(filePath: string | undefined, context: vscode.ExtensionContext) {
    // Dump current state first.
    this._saveToState(context)

    // Load new one.
    this.filePath = filePath
    this._loadFromState(context)
  },

  init(context: vscode.ExtensionContext) {
    this.loadForFile(
      vscode.window.activeTextEditor?.document?.uri.fsPath,
      context
    )
  },

  toggleBookmarks(context: vscode.ExtensionContext) {
    if (!vscode.window.activeTextEditor) {
      return
    }

    const mainSelection = vscode.window.activeTextEditor.selection
    if (
      vscode.window.activeTextEditor.selections.length === 1 &&
      mainSelection.start.line < mainSelection.end.line
    ) {
      // If there are some markers inside selection - we just clear them.
      if (
        this._clearBookmarksAtLines(
          createLinesRange(mainSelection.start.line, mainSelection.end.line)
        )
      ) {
        return
      }
    }

    const lines = vscode.window.activeTextEditor.selections.map(
      (selection) => selection.active.line
    )

    const currentLines = this._getLines()
    const newLines = lines.filter((l) => !currentLines.includes(l))

    if (newLines.length) {
      newLines.forEach((l) => this._bookmarkLine(l, context))
    } else {
      this._clearBookmarksAtLines(lines)
    }
  },

  clearAllBookmarks(context: vscode.ExtensionContext) {
    if (!vscode.window.activeTextEditor) {
      return
    }

    Object.values(this.bookmarks).forEach(({ decoration }) =>
      decoration.dispose()
    )

    this._clearBookmarks()
    this._saveToState(context)
  },

  navigateToNext() {
    if (!vscode.window.activeTextEditor) {
      return
    }

    const currentLine = vscode.window.activeTextEditor.selection.active.line
    const lines = this._getLines()

    let nextLine = getNextLine(lines, currentLine)

    logger.info(
      `try to navigate from current line which is ${currentLine} to ${nextLine}`
    )

    moveCursorToLine(nextLine)
  },

  handleTextChanges(
    context: vscode.ExtensionContext,
    contentChanges: ReadonlyArray<vscode.TextDocumentContentChangeEvent>
  ) {
    if (!contentChanges.length) {
      return
    }

    let lines = this._getLines()
    contentChanges.forEach((contentChange) => {
      lines = handleEdit(lines, contentChange)
    })

    this._clearBookmarks()
    this._setBookmarkLines(context, lines)

    if (isDebug()) {
      this._saveToState(context)
      this._loadFromState(context)
    }
  },
}
