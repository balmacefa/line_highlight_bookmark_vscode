/**
 * bookmarks.ts
 * 
 * Manejador centralizado de "bookmarks" o marcadores visuales en líneas del editor de código.
 * Esta funcionalidad permite al usuario resaltar líneas específicas con una decoración visual 
 * personalizada (como un fondo de color), y navegar entre ellas de forma eficiente.
 * 
 * Características principales:
 * - Añadir o eliminar bookmarks en líneas específicas o rangos seleccionados.
 * - Persistencia de bookmarks por archivo usando `workspaceState`.
 * - Restauración automática de bookmarks al volver a abrir un archivo.
 * - Navegación entre bookmarks (siguiente y anterior).
 * - Respuesta a cambios del documento para mantener las posiciones de bookmarks consistentes.
 * 
 * Este módulo expone un singleton `bookmarksManager` que gestiona:
 * - La colección de bookmarks activos por archivo.
 * - Decoraciones de VS Code asociadas a cada línea marcada.
 * - Guardado y restauración del estado de bookmarks.
 * - Interacciones con el cursor y la selección del editor.
 * 
 * Requiere:
 * - API de VS Code (`vscode`)
 * - Utilidades locales (`utils.ts`, `handleEdit.ts`, `logger.ts`)
 */

import * as vscode from 'vscode'
import { logger } from './logger'
import {
  isDebug,
  fileExists,
  getNextLine,
  getPrevLine,
  moveCursorToLine,
  line2range,
  createDecoration,
  createLinesRange,
} from './utils'
import { handleEdit } from './handleEdit'

const storeKey = 'lineHighlightBookmark'

type Bookmarks = {
  [bookmarkKey: string]: {
    line: number
    decoration: vscode.TextEditorDecorationType
  }
}

type BookmarksStateDump = {
  [filePath: string]: number[]
}

// Utilidad para crear la clave interna de un marcador a partir del número de línea
function getKey(line: number) {
  return `b${line}`
}

/**
 * Gestor de marcadores de línea con resaltado para Visual Studio Code.
 * Permite crear, eliminar, navegar y persistir marcadores en archivos individuales.
 */
export const bookmarksManager = {
  bookmarks: {} as { [filePath: string]: Bookmarks },
  filePath: '' as string | undefined,

  /**
   * Obtiene todos los marcadores para el archivo actual o un marcador específico por clave.
   */
  _getBookmarks(key: string | null = null): Bookmarks | any {
    if (this.filePath) {
      if (!this.bookmarks[this.filePath]) {
        this.bookmarks[this.filePath] = {}
      }
      return key ? this.bookmarks[this.filePath][key] : this.bookmarks[this.filePath]
    }
  },

  /**
   * Establece un marcador en el archivo actual, borra todos o uno específico si `deleteKey` es true.
   */
  _setBookmarks(
    key: string | null = null,
    value: { line: number; decoration: vscode.TextEditorDecorationType } | null = null,
    deleteKey: boolean = false
  ) {
    if (!this.filePath) return

    if (!this.bookmarks[this.filePath]) {
      this.bookmarks[this.filePath] = {}
    }

    if (key) {
      if (deleteKey) {
        delete this.bookmarks[this.filePath][key]
      } else if (value !== null) {
        this.bookmarks[this.filePath][key] = value
      }
    } else {
      this.bookmarks[this.filePath] = {}
    }
  },

  /**
   * Devuelve todas las líneas con marcadores del archivo actual.
   */
  _getLines() {
    return Object.values(this._getBookmarks() as Bookmarks)
      .map(({ line }) => line)
      .sort((a, b) => a - b)
  },

  /**
   * Elimina todos los marcadores y disposa sus decoraciones.
   */
  _clearBookmarks() {
    Object.values(this._getBookmarks() as Bookmarks).forEach(({ decoration }) =>
      decoration.dispose()
    )
    this._setBookmarks()
  },

  /**
   * Elimina los marcadores en líneas específicas.
   * Devuelve `true` si se eliminó al menos uno.
   */
  _clearBookmarksAtLines(lines: number[]) {
    let someCleared = false

    lines
      .map(getKey)
      .forEach((key) => {
        const bookmark = this._getBookmarks(key)
        if (bookmark) {
          bookmark.decoration.dispose()
          this._setBookmarks(key, null, true)
          someCleared = true
        }
      })

    return someCleared
  },

  /**
   * Recupera el estado persistido desde el contexto de la extensión.
   */
  _getStoredData(context: vscode.ExtensionContext): BookmarksStateDump {
    try {
      const data: BookmarksStateDump = JSON.parse(
        context.workspaceState.get(storeKey, '{}')
      )
      return data
    } catch (ex: any) {
      logger.error(`_getStoredData ${ex.message}`)
      return {}
    }
  },

  /**
   * Guarda el estado actual de los marcadores del archivo en curso.
   */
  _saveToState(context: vscode.ExtensionContext) {
    if (!this.filePath) return

    const data = {
      ...this._getStoredData(context),
      [this.filePath]: this._getLines(),
    }

    const saveData: BookmarksStateDump = {}

    Object.entries(data).forEach(([filePath, lines]) => {
      if (lines.length && fileExists(filePath)) {
        saveData[filePath] = lines
      }
    })

    logger.info(`will save ${JSON.stringify(saveData)}`)
    context.workspaceState.update(storeKey, JSON.stringify(saveData))
  },

  /**
   * Carga los marcadores almacenados para el archivo actual.
   */
  _loadFromState(context: vscode.ExtensionContext) {
    const data = this._getStoredData(context)
    if (this.filePath) {
      this._setBookmarkLines(context, data[this.filePath])
    }
  },

  /**
   * Reestablece marcadores desde una lista de líneas.
   */
  _setBookmarkLines(context: vscode.ExtensionContext, lines?: number[]) {
    this._clearBookmarks()
    if (!this.filePath || !lines?.length) return

    logger.info(`will load bookmarks for lines ${lines}`)
    lines.forEach((line) => this._bookmarkLine(line, context))
  },

  /**
   * Crea o actualiza un marcador visual en una línea.
   */
  _bookmarkLine(line: number, context: vscode.ExtensionContext) {
    const key = getKey(line)
    const decoration = this._getBookmarks(key)?.decoration || createDecoration(context)
    const range = line2range(line)

    vscode.window.activeTextEditor?.setDecorations(decoration, [range])
    this._setBookmarks(key, { line, decoration })
  },

  /**
   * Guarda el estado actual y carga los marcadores para un nuevo archivo.
   */
  loadForFile(filePath: string | undefined, context: vscode.ExtensionContext) {
    this._saveToState(context)
    this.filePath = filePath
    this._loadFromState(context)
    // Escanea para agregar bookmarks automáticos según la palabra clave
    this._scanForKeywordInDocument(context)
  },



  /**
   * Inicializa los marcadores del archivo actualmente abierto.
   */
  init(context: vscode.ExtensionContext) {
    this.loadForFile(
      vscode.window.activeTextEditor?.document?.uri.fsPath,
      context
    )
  },

  /**
   * Alterna la presencia de marcadores en las líneas seleccionadas.
   */
  toggleBookmarks(context: vscode.ExtensionContext) {
    const editor = vscode.window.activeTextEditor
    if (!editor) return

    const mainSelection = editor.selection

    // Elimina si se selecciona un bloque y ya hay marcadores dentro
    if (
      editor.selections.length === 1 &&
      mainSelection.start.line < mainSelection.end.line &&
      this._clearBookmarksAtLines(
        createLinesRange(mainSelection.start.line, mainSelection.end.line)
      )
    ) {
      return
    }

    const lines = editor.selections.map((selection) => selection.active.line)
    const currentLines = this._getLines()
    const newLines = lines.filter((l) => !currentLines.includes(l))

    if (newLines.length) {
      newLines.forEach((l) => this._bookmarkLine(l, context))
    } else {
      this._clearBookmarksAtLines(lines)
    }
  },

  /**
   * Elimina todos los marcadores del archivo actual.
   */
  clearAllBookmarks(context: vscode.ExtensionContext) {
    if (!vscode.window.activeTextEditor) return

    (Object.values(this._getBookmarks()) as { decoration: vscode.TextEditorDecorationType }[]).forEach(({ decoration }) =>
      decoration.dispose()
    )

    this._clearBookmarks()
    this._saveToState(context)
  },

  /**
   * Navega al siguiente marcador en el archivo.
   */
  navigateToNext() {
    this._navigateToLine(getNextLine)
  },

  /**
   * Navega al marcador anterior en el archivo.
   */
  navigateToPrev() {
    this._navigateToLine(getPrevLine)
  },

  /**
   * Mueve el cursor a la línea siguiente o anterior según el getter proporcionado.
   */
  _navigateToLine(
    lineGetter: (lines: number[], currentLine: number) => number
  ) {
    const editor = vscode.window.activeTextEditor
    if (!editor) return

    const currentLine = editor.selection.active.line
    const lines = this._getLines()
    const nextLine = lineGetter(lines, currentLine)

    logger.info(
      `try to navigate from current line which is ${currentLine} to ${nextLine}`
    )

    moveCursorToLine(nextLine)
  },

  /**
   * Actualiza los marcadores al detectar cambios en el contenido del documento.
   */
  handleTextChanges(
    context: vscode.ExtensionContext,
    contentChanges: ReadonlyArray<vscode.TextDocumentContentChangeEvent>
  ) {
    if (!contentChanges.length) return

    const keyword = vscode.workspace.getConfiguration('lineHighlightBookmark').get<string>('keyword', 'linedoc')
    
    if (!keyword || !this.filePath) return

    const editor = vscode.window.activeTextEditor
    if (!editor) return

    const document = editor.document
    let updatedLines = this._getLines()

    for (const change of contentChanges) {
      const changedLine = change.range.start.line
      const lineText = document.lineAt(changedLine).text
      const key = getKey(changedLine)
      const hasKeyword = lineText.includes(keyword)
      const isBookmarked = !!this._getBookmarks(key)

      if (hasKeyword && !isBookmarked) {
        this._bookmarkLine(changedLine, context)
        updatedLines.push(changedLine)
      }
      
    }

    // Reestablecer bookmarks con líneas actualizadas
    this._setBookmarkLines(context, updatedLines)

    if (isDebug()) {
      this._saveToState(context)
      this._loadFromState(context)
    }
  },

  /**
 * Escanea el archivo activo buscando la palabra clave para marcar bookmarks automáticos.
 */
  _scanForKeywordInDocument(context: vscode.ExtensionContext) {
    const editor = vscode.window.activeTextEditor
    if (!editor) return
    const document = editor.document
    const keyword = vscode.workspace.getConfiguration('lineHighlightBookmark').get<string>('keyword', 'linedoc')
    if (!keyword) return

    let linesToBookmark: number[] = []

    for (let lineNum = 0; lineNum < document.lineCount; lineNum++) {
      const lineText = document.lineAt(lineNum).text
      const key = getKey(lineNum)
      const isBookmarked = !!this._getBookmarks(key)
      if (lineText.includes(keyword) && !isBookmarked) {
        linesToBookmark.push(lineNum)
      }
    }

    if (linesToBookmark.length) {
      linesToBookmark.forEach(line => this._bookmarkLine(line, context))
      const allLines = [...new Set([...this._getLines(), ...linesToBookmark])].sort((a, b) => a - b)
      this._setBookmarkLines(context, allLines)
    }
  },


}
