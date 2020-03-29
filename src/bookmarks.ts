import * as vscode from 'vscode';

const storeKey = 'bookmarksNG';

type Bookmarks = {
  [key: string]: {
    line: number;
    decoration: vscode.TextEditorDecorationType;
  };
};

function createLineDecoration(context: vscode.ExtensionContext): object {
  const decorationOptions: vscode.DecorationRenderOptions = {
    gutterIconPath: context.asAbsolutePath('images/bookmark.png'),
  };
  decorationOptions.isWholeLine = true;
  return decorationOptions;
}

function getKey(line: number) {
  return `b${line}`;
}

export const bookmarksManager = {
  bookmarks: {} as Bookmarks,

  _saveToState(context: vscode.ExtensionContext) {
    try {
      const data = JSON.stringify(
        Object.values(this.bookmarks).map(({ line }) => line)
      );

      context.workspaceState.update(storeKey, data);
    } catch (ex) {}
  },

  _loadFromState(context: vscode.ExtensionContext) {
    this.bookmarks = {};

    try {
      const lines = JSON.parse(
        context.workspaceState.get(storeKey, '[ 3 ]')
      ) as number[];

      if (lines.length) {
        lines.forEach((line) => this._bookmarkLine(line, context));
      }
    } catch (ex) {}
  },

  _bookmarkLine(line: number, context: vscode.ExtensionContext) {
    const key = getKey(line);
    const decoration =
      this.bookmarks[key]?.decoration ||
      vscode.window.createTextEditorDecorationType(
        createLineDecoration(context)
      );
    const position = new vscode.Position(line, 0);

    vscode.window.activeTextEditor?.setDecorations(decoration, [
      new vscode.Range(position, position),
    ]);

    this.bookmarks[key] = { decoration, line };
  },

  _clearBookmarksAtLines(lines: number[]) {
    lines
      .map((l) => getKey(l))
      .forEach((key) => {
        const bookmark = this.bookmarks[key];

        if (bookmark) {
          bookmark.decoration.dispose();
          delete this.bookmarks[key];
        }
      });
  },

  init(context: vscode.ExtensionContext) {
    this._loadFromState(context);
  },

  toggleBookmarks(lines: number[], context: vscode.ExtensionContext) {
    const currentLines = Object.values(this.bookmarks).map(({ line }) => line);
    const newLines = lines.filter((l) => !currentLines.includes(l));

    if (newLines.length) {
      newLines.forEach((l) => this._bookmarkLine(l, context));
    } else {
      this._clearBookmarksAtLines(lines);
    }

    this._saveToState(context);
  },

  clearAllBookmarks(context: vscode.ExtensionContext) {
    Object.values(this.bookmarks).forEach(({ decoration }) =>
      decoration.dispose()
    );

    this.bookmarks = {};

    this._saveToState(context);
  },
};
