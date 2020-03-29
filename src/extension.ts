import * as vscode from 'vscode';
import { bookmarksManager } from './bookmarks';

export function activate(context: vscode.ExtensionContext) {
  bookmarksManager.init(context);

  context.subscriptions.push(
    vscode.commands.registerCommand('bookmarksNG.toogleBookmarks', () => {
      if (!vscode.window.activeTextEditor) {
        return;
      }

      const lines = vscode.window.activeTextEditor.selections.map(
        (selection) => selection.active.line
      );

      bookmarksManager.toggleBookmarks(lines, context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('bookmarksNG.clearAllBookmarks', () => {
      if (!vscode.window.activeTextEditor) {
        return;
      }

      bookmarksManager.clearAllBookmarks(context);
    })
  );

  // Load bookmarks after active file changes.
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      bookmarksManager.loadForFile(editor?.document.uri.fsPath, context);
    },
    null,
    context.subscriptions
  );
}

export function deactivate() {}
