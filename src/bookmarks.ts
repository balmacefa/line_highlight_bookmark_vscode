import * as vscode from 'vscode';
import { logger } from './logger';
import { fileExists } from './utils';

const storeKey = 'bookmarksNG';

type Bookmarks = {
  [bookmarkKey: string]: {
    line: number;
    decoration: vscode.TextEditorDecorationType;
  };
};

type BookmarksStateDump = {
  [filePath: string]: number[];
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
  filePath: '' as string | undefined,

  _getStoredData(context: vscode.ExtensionContext): BookmarksStateDump {
    try {
      const data: BookmarksStateDump = JSON.parse(
        context.workspaceState.get(storeKey, '{}')
      );
      return data;
    } catch (ex) {
      logger.error(`_getStoredData ${ex.message}`);
      return {};
    }
  },

  _saveToState(context: vscode.ExtensionContext) {
    if (!this.filePath) {
      return;
    }

    const data = {
      ...this._getStoredData(context),
      [this.filePath]: Object.values(this.bookmarks).map(({ line }) => line),
    };
    const saveData: BookmarksStateDump = {};

    Object.keys(data).forEach((filePath) => {
      const lines = data[filePath];
      if (lines.length && fileExists(filePath)) {
        saveData[filePath] = lines;
      }
    });

    logger.info(`will save ${JSON.stringify(saveData)}`);

    context.workspaceState.update(storeKey, JSON.stringify(saveData));
  },

  _loadFromState(context: vscode.ExtensionContext) {
    const data = this._getStoredData(context);

    this.bookmarks = {};

    logger.info(
      `will load bookmarks for file ${this.filePath} ${JSON.stringify(data)}`
    );

    if (this.filePath && data[this.filePath]?.length) {
      data[this.filePath].forEach((line) => this._bookmarkLine(line, context));
    }
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

  loadForFile(filePath: string | undefined, context: vscode.ExtensionContext) {
    this.filePath = filePath;
    this._loadFromState(context);
  },

  init(context: vscode.ExtensionContext) {
    this.loadForFile(
      vscode.window.activeTextEditor?.document?.uri.fsPath,
      context
    );
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
