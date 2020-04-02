import * as vscode from 'vscode'
import { bookmarksManager } from './bookmarks'
import { logger } from './logger'

export function activate(context: vscode.ExtensionContext) {
  bookmarksManager.init(context)

  context.subscriptions.push(
    vscode.commands.registerCommand('bookmarksNG.toogleBookmarks', () => {
      if (!vscode.window.activeTextEditor) {
        return
      }

      const lines = vscode.window.activeTextEditor.selections.map(
        (selection) => selection.active.line
      )

      bookmarksManager.toggleBookmarks(lines, context)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('bookmarksNG.clearAllBookmarks', () => {
      if (!vscode.window.activeTextEditor) {
        return
      }

      bookmarksManager.clearAllBookmarks(context)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'bookmarksNG.navigateToNextBookmark',
      () => {
        if (!vscode.window.activeTextEditor) {
          return
        }

        bookmarksManager.navigateToNext()
      }
    )
  )

  // Load bookmarks after active file changes.
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      bookmarksManager.loadForFile(editor?.document.uri.fsPath, context)
    },
    null,
    context.subscriptions
  )

  // The only way for now to keep bookmarks positions in sync with what is shown in VS Code.
  // @see https://github.com/microsoft/vscode/issues/54147
  vscode.workspace.onDidChangeTextDocument((event) => {
    bookmarksManager.handleTextChanges(context, event.contentChanges)
  })
}

export function deactivate() {}
