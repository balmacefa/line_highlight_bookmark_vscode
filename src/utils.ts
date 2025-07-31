/**
 * @file utils.ts
 * @description
 * Conjunto de funciones utilitarias para la extensión de VSCode "lineHighlightBookmark".
 * Estas funciones incluyen:
 * - Comprobación de existencia de archivos.
 * - Manipulación y navegación del cursor dentro del editor.
 * - Creación y gestión de decoraciones para resaltar líneas.
 * - Utilidades para el manejo de rangos y selección de líneas.
 *
 * Estas utilidades facilitan el manejo de bookmarks en líneas específicas,
 * ayudando a navegar, mostrar decoraciones y mantener la sincronización
 * visual de los marcadores en el editor.
 *
 * @module utils
 */


import * as fs from 'fs'
import * as vscode from 'vscode'
import { logger } from './logger'

const LINE_END = 999 // Valor alto para representar el final de una línea

/** Determina si el modo debug está activado */
export const isDebug = () => false

/** Verifica si un archivo existe en la ruta dada */
export const fileExists = (path: string): boolean => fs.existsSync(path)

/**
 * Mueve el cursor a una línea y columna específica en el editor activo.
 * Si no se especifica columna, va al final lógico de la línea.
 */
export const moveCursorToLine = (line: number) => {
  const editor = vscode.window.activeTextEditor
  if (!editor) return

  const config = vscode.workspace.getConfiguration('lineHighlightBookmark')

  const alignTop: boolean = config.get('alignTopOnNavigation', false)
  const cursorPosition: 'lineStart' | 'lineEnd' = config.get('cursorPositionOnNavigation', 'lineStart')

  const reviewType: vscode.TextEditorRevealType = alignTop
    ? vscode.TextEditorRevealType.AtTop
    : vscode.TextEditorRevealType.InCenterIfOutsideViewport

  const lineText = editor.document.lineAt(line).text

  let column: number

  if (cursorPosition === 'lineStart') {
    // Índice del primer carácter no vacío (no espacio/tab)
    column = lineText.search(/\S|$/) // Si no hay texto, será 0
  } else {
    // Final lógico de la línea
    column = lineText.length
  }

  const newSelection = new vscode.Selection(line, column, line, column)
  editor.selection = newSelection
  editor.revealRange(newSelection, reviewType)
}


/** Convierte un número de línea a un objeto Range que representa toda la línea */
export const line2range = (line: number): vscode.Range => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return new vscode.Range(0, 0, 0, 0) // Retorna un rango vacío si no hay editor activo

  const start = new vscode.Position(line, 0)
  const end = new vscode.Position(line, editor.document.lineAt(line).range.end.character)
  return new vscode.Range(start, end)
}

/** Extrae el número de línea desde un Range */
export const range2line = (range: vscode.Range): number => range.start.line

/**
 * Retorna la siguiente línea marcada respecto a la línea actual.
 * Si no hay una posterior, vuelve al primer bookmark.
 */
export const getNextLine = (lines: number[], currentLine: number): number => {
  if (!lines.length) return currentLine

  logger.info(`getNextLine: ${JSON.stringify(lines)} ${currentLine}`)

  if (currentLine < lines[0] || currentLine >= lines[lines.length - 1]) {
    return lines[0]
  }

  const index = lines.findIndex(line => line > currentLine);
  return index === -1 ? lines[0] : lines[index];
}

/**
 * Retorna la línea marcada anterior respecto a la actual.
 * Si no hay una anterior, vuelve al último bookmark.
 */
export const getPrevLine = (lines: number[], currentLine: number): number => {
  if (!lines.length) return currentLine

  logger.info(`getPrevLine: ${JSON.stringify(lines)} ${currentLine}`)

  if (currentLine > lines[lines.length - 1] || currentLine <= lines[0]) {
    return lines[lines.length - 1]
  }

  let index = lines.length - 2
  while (currentLine <= lines[index]) index--

  return lines[index + 1]
}

/**
 * Crea el tipo de decoración que se usará para resaltar líneas en el editor.
 * La decoración puede incluir íconos en el margen y un borde inferior si está habilitado.
 */
export const createDecoration = (
  context: vscode.ExtensionContext
): vscode.TextEditorDecorationType => {
  const config = vscode.workspace.getConfiguration('lineHighlightBookmark')
  const renderLine = config.get<boolean>('renderLine', true)
  const borderColor = config.get<string>('lineColor', '#65EAB9')

  const baseOptions: vscode.DecorationRenderOptions = {
    gutterIconPath: context.asAbsolutePath('images/icon.svg'),
    dark: {
      gutterIconPath: context.asAbsolutePath('images/icond.svg'),
    },
    overviewRulerColor: borderColor, // muestra barra amarilla en minimapa y barra lateral
    overviewRulerLane: vscode.OverviewRulerLane.Full, // posición en la regla lateral/minimapa
  }

  if (renderLine) {
    const borderWidth = config.get<string>('lineWidth', '2px')
    const borderStyle = config.get<string>('lineStyle', 'solid')

    return vscode.window.createTextEditorDecorationType({
      ...baseOptions,
      isWholeLine: true,
      borderWidth: `0 0 ${borderWidth} 0`,
      borderStyle,
      borderColor,
    })
  }

  return vscode.window.createTextEditorDecorationType(baseOptions)
}

/**
 * Crea un arreglo de líneas desde `start` hasta `endInclusive`, inclusive.
 * @example createLinesRange(2, 5) => [2, 3, 4, 5]
 */
export const createLinesRange = (start: number, endInclusive: number): number[] =>
  Array.from({ length: endInclusive - start + 1 }, (_, i) => start + i)
