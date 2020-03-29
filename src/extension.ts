import * as vscode from 'vscode';

let bookmarkLines: { [key: string]: vscode.TextEditorDecorationType } = {};

function createLineDecoration(
  context: vscode.ExtensionContext
): vscode.TextEditorDecorationType {
  const decorationOptions: vscode.DecorationRenderOptions = {
    gutterIconPath: context.asAbsolutePath('images/bookmark.png'),
    // gutterIconPath: context.asAbsolutePath("images/icon.svg"),
    // gutterIconPath: context.asAbsolutePath("images/icon2.svg"),
  };
  decorationOptions.isWholeLine = true;
  return vscode.window.createTextEditorDecorationType(decorationOptions);
}

const toogleBookmarks = (context: vscode.ExtensionContext) => {
  if (!vscode.window.activeTextEditor) {
    return;
  }

  const selections = vscode.window.activeTextEditor.selections;
  let hasNewBookmarks = false;
  const pairs = [];

  for (let selection of selections) {
    const position = selection.active;
    const key: string = `b${position.line}`;
    hasNewBookmarks = hasNewBookmarks || !bookmarkLines[key];

    // We create new decorator for each line that they can be disposed independently.
    bookmarkLines[key] = bookmarkLines[key] || createLineDecoration(context);

    pairs.push({ decoration: bookmarkLines[key], position, key });
  }

  if (hasNewBookmarks) {
    pairs.forEach(({ decoration, position }) =>
      vscode.window.activeTextEditor!.setDecorations(decoration, [
        new vscode.Range(position, position),
      ])
    );
  } else {
    pairs.forEach(({ decoration, key }) => {
      decoration.dispose();
      delete bookmarkLines[key];
    });
  }
};

const clearBookmarks = () => {
  if (!vscode.window.activeTextEditor) {
    return;
  }

  Object.values(bookmarkLines).forEach((decoration) => decoration.dispose());
  bookmarkLines = {};
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('bookmarksNG.toogleBookmarks', () => {
      toogleBookmarks(context);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('bookmarksNG.clearAllBookmarks', () => {
      clearBookmarks();
    })
  );
}

export function deactivate() {}
