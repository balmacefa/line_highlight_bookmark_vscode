import * as vscode from 'vscode'
import { isDebug } from './utils'

export const logger = {
  info(message: string) {
    if (isDebug()) {
      vscode.window.showInformationMessage(message)
    }
  },

  error(message: string) {
    if (isDebug()) {
      vscode.window.showErrorMessage(message)
    }
  },
}
