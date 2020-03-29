import * as fs from 'fs';
import * as vscode from 'vscode';
import { logger } from './logger';

export const fileExists = (path: string) => fs.existsSync(path);

export const moveCursorToLine = (line: number, column: number = 999) => {
  if (!vscode.window.activeTextEditor) {
    return;
  }

  let reviewType: vscode.TextEditorRevealType =
    vscode.TextEditorRevealType.InCenter;

  if (line === vscode.window.activeTextEditor.selection.active.line) {
    reviewType = vscode.TextEditorRevealType.InCenterIfOutsideViewport;
  }

  const newSelection = new vscode.Selection(line, column, line, column);
  vscode.window.activeTextEditor.selection = newSelection;
  vscode.window.activeTextEditor.revealRange(newSelection, reviewType);
};

export const getNextLine = (lines: number[], currentLine: number): number => {
  if (!lines.length) {
    return currentLine;
  }

  logger.info(`${JSON.stringify(lines)} ${currentLine}`);

  if (currentLine < lines[0]) {
    return lines[0];
  } else if (currentLine >= lines[lines.length - 1]) {
    return lines[0];
  }

  let index = 1;
  while (currentLine >= lines[index++]) {}

  return lines[index - 1];
};

// Manual tests...

// const ar = [0, 1, 3, 5, 6, 7, 9, 10];
// const check = (val: number, okResult: number) => {
//   const res = getNextLine(ar, val);
//   console.log(`Expected ${okResult} got ${res}`);
//   console.assert(res === okResult, `Expected ${okResult} got ${res}`);
// };

// check(0, 1);
// check(1, 3);
// check(2, 3);
// check(3, 5);
// check(4, 5);
// check(5, 6);
// check(6, 7);
// check(7, 9);
// check(8, 9);
// check(9, 10);
// check(10, 0);
