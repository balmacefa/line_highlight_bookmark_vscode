/**
 * extension.ts
 * 
 * Punto de entrada principal de la extensión "Line Highlight Bookmark" para Visual Studio Code.
 * Registra los comandos disponibles y enlaza los eventos del entorno de VS Code con el manejador
 * centralizado de bookmarks (`bookmarksManager`).
 * 
 * Funcionalidades expuestas:
 * - Activación y desactivación de la extensión (`activate`, `deactivate`)
 * - Registro de comandos:
 *   - `lineHighlightBookmark.toogleBookmarks`: Marca o desmarca líneas seleccionadas como bookmarks.
 *   - `lineHighlightBookmark.clearAllBookmarks`: Elimina todos los bookmarks del archivo actual.
 *   - `lineHighlightBookmark.navigateToNextBookmark`: Salta al siguiente bookmark.
 *   - `lineHighlightBookmark.navigateToPrevBookmark`: Salta al bookmark anterior.
 * 
 * - Eventos del entorno:
 *   - Al cambiar de editor activo (`onDidChangeActiveTextEditor`), se carga el estado de bookmarks
 *     para el nuevo archivo.
 *   - Al modificar el contenido de un archivo (`onDidChangeTextDocument`), se ajustan las posiciones
 *     de los bookmarks para mantenerse sincronizadas.
 * 
 * Este archivo delega la lógica de estado, persistencia y decoración visual al módulo `bookmarks.ts`.
 */

import * as vscode from 'vscode'
import { bookmarksManager } from './bookmarks'

export function activate(context: vscode.ExtensionContext) {
  bookmarksManager.init(context)

  context.subscriptions.push(
    vscode.commands.registerCommand('lineHighlightBookmark.toogleBookmarks', () => {
      bookmarksManager.toggleBookmarks(context)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('lineHighlightBookmark.clearAllBookmarks', () => {
      bookmarksManager.clearAllBookmarks(context)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'lineHighlightBookmark.navigateToNextBookmark',
      () => {
        bookmarksManager.navigateToNext()
      }
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'lineHighlightBookmark.navigateToPrevBookmark',
      () => {
        bookmarksManager.navigateToPrev()
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
