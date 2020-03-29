import * as vscode from 'vscode';

export const logger = {
  debug: false,

  info(message: string) {
    if (this.debug) {
      vscode.window.showInformationMessage(message);
    }
  },

  error(message: string) {
    if (this.debug) {
      vscode.window.showErrorMessage(message);
    }
  },
};
