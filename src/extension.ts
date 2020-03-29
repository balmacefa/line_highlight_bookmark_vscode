import * as vscode from 'vscode';
import { bookmarksManager } from './bookmarks';

export function activate(context: vscode.ExtensionContext) {
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
}

export function deactivate() {}
